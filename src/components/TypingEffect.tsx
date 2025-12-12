import { useEffect, useState } from "react";
import type { FC } from "react";

interface TypingEffectProps {
  text: string;
  delay: number;
  typingSpeed: number;
  deleteCursorOnEnd: boolean;
  className?: string;
  prefix?: string;
  suffix?: string;
  link?: boolean;
  skip?: boolean;
}

const TypingEffect: FC<TypingEffectProps> = ({
  text,
  delay,
  typingSpeed,
  deleteCursorOnEnd,
  className,
  prefix,
  link,
  skip,
}) => {
  const [_text, _setText] = useState("");
  const [showCursor, setShowCursor] = useState(false);
  const [showPrefix, setShowPrefix] = useState(false);

  const startTyping = () => {
    setTimeout(() => {
      if (_text.length === text.length) {
        return setShowCursor(!deleteCursorOnEnd);
      }
      _setText(_text + text[_text.length]);
    }, typingSpeed);
  };

  useEffect(() => {
    if (skip) return;
    if (_text !== "") return startTyping();
    setTimeout(() => {
      setShowCursor(true);
      setShowPrefix(true);
      startTyping();
    }, delay);
  }, [_text]);

  useEffect(() => {
    if (!skip) return;
    setShowCursor(!deleteCursorOnEnd);
    setShowPrefix(true);
  }, [skip]);

  useEffect(() => {
    if (!skip) return;
    setShowCursor(!deleteCursorOnEnd);
    setShowPrefix(true);
  }, [showCursor]);

  return (
    <>
      {skip ? (
        <p className={className + " break-all whitespace-pre-wrap tracking-wide leading-7"}>
          {showPrefix && prefix && <span>{prefix}</span>}
          {link ? <a href={text}>{text}</a> : text}
          {showCursor && (
            <span className="align-middle border-l-2 h-1 animate-ping"></span>
          )}
        </p>
      ) : (
        <p
          className={
            _text !== "" ? className + " break-all whitespace-pre-wrap tracking-wide leading-7" : ""
          }
        >
          {showPrefix && prefix && <span>{prefix}</span>}
          {link ? <a href={_text}>{_text}</a> : _text}
          {showCursor && (
            <span className="align-middle border-l-2 h-1 animate-ping"></span>
          )}
        </p>
      )}
    </>
  );
};

export default TypingEffect;
