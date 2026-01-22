import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    MathJax: any;
  }
}

interface MathRendererProps {
  text: string;
  className?: string;
  inline?: boolean;
}

const MathRenderer: React.FC<MathRendererProps> = ({ text, className = "", inline = false }) => {
  const ref = useRef<HTMLDivElement>(null);

  // Pre-process text to handle newlines, spacing, and unbalanced delimiters
  const processText = (input: string) => {
    if (!input) return "";
    
    let processed = input;

    // 1. Balance Dollar Signs
    const dollarCount = (processed.match(/(?<!\\)\$/g) || []).length;
    if (dollarCount % 2 !== 0) {
      processed += " $"; // Close the dangling tag
    }

    // 2. Replace actual newlines with HTML breaks
    processed = processed.replace(/\n/g, '<br />');
    
    // 3. Handle double/triple spaces as line breaks (common AI artifact for "separation")
    processed = processed.replace(/\s{3,}/g, '<br /><br />');
    processed = processed.replace(/\s{2,}/g, '<br />');

    // 4. Spacing around Delimiters: Enforce space between [letter] and $
    processed = processed.replace(/([a-zA-Z0-9])(\$)/g, '$1 $2');
    processed = processed.replace(/(\$)([a-zA-Z0-9])/g, '$1 $2');

    // 5. Replace bullet points "- " at start of lines (after breaks) with a visual bullet
    // This helps simple markdown-like lists render better
    processed = processed.replace(/(<br \/>|^)\s*-\s/g, '$1&bull; ');

    return processed;
  };

  useEffect(() => {
    let isMounted = true;

    const renderMath = async () => {
      if (window.MathJax && ref.current) {
        // Set content with processed text
        ref.current.innerHTML = processText(text);
        
        try {
            await window.MathJax.typesetPromise([ref.current]);
        } catch (err) {
            // console.debug('MathJax typesetting warning:', err);
            if (isMounted && window.MathJax.typesetClear) {
                try {
                    window.MathJax.typesetClear([ref.current]);
                    await window.MathJax.typesetPromise([ref.current]);
                } catch (e) { /* ignore retry failure */ }
            }
        }
      }
    };

    renderMath();
    
    return () => { isMounted = false; };
  }, [text]);

  const Tag = inline ? 'span' : 'div';

  return (
    <Tag 
      ref={ref} 
      className={`math-content ${className} text-inherit leading-loose tracking-wide`} 
      style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
    />
  );
};

export default MathRenderer;