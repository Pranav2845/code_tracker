// src/components/ContestDetailModal.jsx

import React, { useEffect, useRef } from "react";
import Icon from "./AppIcon";
import AddToCalendarButton from "./AddToCalendarButton";
import PlatformLogo from "./PlatformLogo";
import { formatDateIST, formatTimeRangeIST } from "../utils/contestEventUtils.js";

function formatDuration(ms) {
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours && minutes) return `${hours} hrs ${minutes} mins`;
  if (hours) return `${hours} hrs`;
  return `${minutes} mins`;
}

function getStatusText(event) {
  if (!event?.end) return "";
  return new Date(event.end).getTime() > Date.now() ? "Upcoming" : "Contest Ended";
}

export default function ContestDetailModal({ event, onClose }) {
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

  // Fallback for backwards compatibility (in case you don't have popupDetail in originalData)
  const popupDetail = event.popupDetail || event.originalData?.popupDetail || {};

  // Allow fallback to event fields if popupDetail not available
  const title = popupDetail.title || event.title;
  const date = popupDetail.date || formatDateIST(event.start);
  const time = popupDetail.time || formatTimeRangeIST(event.start, event.end);
  const duration = popupDetail.duration || formatDuration(new Date(event.end) - new Date(event.start));
  const status = popupDetail.status || getStatusText(event);
  const url = popupDetail.url || event.url;
  const platform = popupDetail.platform || event.platform;
  const platformLogo = popupDetail.platformLogo;
  const addToCalendarUrl = popupDetail.addToCalendarUrl;

  const isEnded = status.toLowerCase().includes("ended");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="bg-surface rounded-xl shadow-xl w-full max-w-md animate-pop relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={{ maxHeight: "95vh", overflowY: "auto" }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          ref={initialFocusRef}
          className="absolute top-3 right-3 text-text-tertiary hover:text-primary rounded-full p-1"
          aria-label="Close modal"
        >
          <Icon name="X" size={22} />
        </button>

        {/* Modal Content */}
        <div className="p-6">
          {/* Header: Logo + Title */}
          <div className="flex items-center gap-2 mb-3">
            <PlatformLogo platform={platform} className="w-7 h-7" />
            <h2 id="modal-title" className="text-lg font-bold">{title}</h2>
          </div>
          <div className="space-y-3 text-base">
            <div className="flex items-center gap-2">
              <Icon name="Calendar" size={17} className="opacity-80" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Clock" size={17} className="opacity-80" />
              <span>{time}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="AlarmClock" size={17} className="opacity-80" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="AlertTriangle" size={17} className={`opacity-90 ${isEnded ? "text-red-500" : "text-green-500"}`} />
              <span className={isEnded ? "text-red-500 font-semibold" : "text-green-500 font-semibold"}>
                {status}
              </span>
            </div>
            <div className="flex items-center gap-2 break-all">
              <Icon name="ExternalLink" size={17} className="opacity-80" />
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline flex items-center gap-1"
              >
                {url}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <PlatformLogo platform={platform} className="w-4 h-4" />
              <span className="font-medium">{platform}</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <a
                href={addToCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline font-medium"
              >
                Add to Calendar
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
