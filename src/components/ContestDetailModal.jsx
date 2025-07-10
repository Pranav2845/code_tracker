import React, { useEffect, useRef } from "react";
import Icon from "./AppIcon";
import AddToCalendarButton from "./AddToCalendarButton";
import PlatformLogo from "./PlatformLogo";

function ContestDetailModal({ event, onClose }) {
  const modalRef = useRef(null);
  const initialFocusRef = useRef(null);

  useEffect(() => {
    initialFocusRef.current?.focus();
    const handleEscape = (e) => e.key === "Escape" && onClose();
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  if (!event) return null;

  const { title, start, end, url, platform, originalData } = event;
  const popupDetail = originalData?.popupDetail;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="bg-surface rounded-lg shadow-xl w-full max-w-md animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-start justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <PlatformLogo platform={platform} className="w-6 h-6" />
            <h2 id="modal-title" className="text-xl font-semibold text-text-primary">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            ref={initialFocusRef}
            className="text-text-tertiary hover:text-text-primary rounded-full p-1"
            aria-label="Close modal"
          >
            <Icon name="X" size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="text-sm text-text-secondary space-y-1">
            <p>
              {new Date(start).toLocaleString()} - {new Date(end).toLocaleString()}
            </p>
            {popupDetail && <p className="whitespace-pre-line">{popupDetail}</p>}
          </div>
          <div className="flex justify-between items-center">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary py-2 px-4 flex items-center text-sm"
            >
              <Icon name="ExternalLink" size={16} className="mr-2" />
              Visit Contest
            </a>
            <AddToCalendarButton contest={originalData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContestDetailModal;