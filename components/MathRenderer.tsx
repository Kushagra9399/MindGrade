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

    // 2. Normalize newlines: Allow up to 4 newlines (3 blank lines)
    processed = processed.replace(/\n{5,}/g, '\n\n\n\n');
    
    // 3. Handle multiple spaces: Rely on CSS whitespace-pre-wrap
    
    // 4. Spacing around Delimiters: Enforce space between [letter] and $
    processed = processed.replace(/([a-zA-Z0-9])(\$)/g, '$1 $2');
    processed = processed.replace(/(\$)([a-zA-Z0-9])/g, '$1 $2');

    // 5. Replace bullet points "- " at start of lines with a visual bullet
    processed = processed.replace(/(\n|^)\s*-\s/g, '$1&bull; ');

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
      className={`math-content ${className} text-inherit leading-loose tracking-wide whitespace-pre-wrap`} 
      style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
    />
  );
};

export default MathRenderer;