import React, { useEffect, useRef, useState } from "react";

export interface PersonaOption {
    id: string;
    label: string;
}

interface PersonaDropdownProps {
    id?: string;
    value: string;
    onChange: (idOrText: string) => void;
    options: PersonaOption[];
    placeholder?: string;

    customId?: string;
    customValue?: string;
    onCustomChange?: (text: string) => void;
}

const PersonaDropdown: React.FC<PersonaDropdownProps> = ({
    id,
    value,
    onChange,
    options,
    placeholder = "페르소나를 선택하세요",
    customId = "custom",
    customValue = "",
    onCustomChange,
}) => {
    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState<string>("");
    const wrapRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selected = options.find((o) => o.id === value) || null;
    const isFreeText = !selected && value.length > 0;

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (!wrapRef.current) return;
            if (!wrapRef.current.contains(e.target as Node)) {
                setOpen(false);
                if (isEditing) commitOrCancel();
            }
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, [isEditing, draft, customValue, value]);

    useEffect(() => {
        if (isEditing) {
            const t = setTimeout(() => inputRef.current?.focus(), 0);
            return () => clearTimeout(t);
        }
    }, [isEditing]);

    const onTriggerKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    };

    const handleSelect = (nextId: string) => {
        if (nextId === customId) {
            setOpen(false);
            setIsEditing(true);
            setDraft("");
            return;
        }
        onChange(nextId);
        setOpen(false);
        setIsEditing(false);
    };

    const onInputKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key === "Enter") {
            commit();
        } else if (e.key === "Escape") {
            cancel();
        }
    };

    const commit = () => {
        const text = (draft ?? customValue ?? "").trim();
        if (text) {
            onChange(text);
            onCustomChange?.(text);
        } else {
            onChange("");
            onCustomChange?.("");
        }
        setIsEditing(false);
    };

    const cancel = () => {
        setIsEditing(false);
        if (!value || value === customId) {
            onChange("");
        }
    };

    const commitOrCancel = () => {
        const text = (draft ?? customValue ?? "").trim();
        if (text) commit();
        else cancel();
    };

    return (
        <div ref={wrapRef} className="cs-dd">
            {!isEditing ? (
                <button
                    id={id}
                    type="button"
                    className={`cs-dd-trigger ${open ? "is-open" : ""}`}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    onClick={() => setOpen((v) => !v)}
                    onKeyDown={onTriggerKeyDown}
                >
                    <span className={`cs-dd-value ${selected || isFreeText ? "" : "is-placeholder"}`}>
                        {selected ? selected.label : (isFreeText ? value : placeholder)}
                    </span>
                    <span className={`cs-dd-caret ${open ? 'is-rotated' : ''}`} aria-hidden>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6,9 12,15 18,9"></polyline>
                        </svg>
                    </span>
                </button>
            ) : (
                <div className="cs-dd-trigger is-open" aria-expanded={true}>
                    <input
                        ref={inputRef}
                        id={id}
                        type="text"
                        className="cs-dd-input"
                        placeholder="원하는 페르소나를 입력하세요"
                        value={draft}
                        onChange={(e) => {
                            setDraft(e.target.value);
                            onCustomChange?.(e.target.value);
                        }}
                        onKeyDown={onInputKeyDown}
                        onBlur={commitOrCancel}
                    />
                </div>
            )}

            {/* 드롭다운 메뉴 (입력 모드일 때는 숨김) */}
            {open && !isEditing && (
                <div className="cs-dd-menu" role="listbox" aria-labelledby={id}>
                    {options.map((opt) => {
                        const active = opt.id === value;
                        return (
                            <div
                                key={opt.id}
                                role="option"
                                aria-selected={active}
                                tabIndex={0}
                                className={`cs-dd-item ${active ? "is-active" : ""}`}
                                onClick={() => handleSelect(opt.id)}
                                onKeyDown={(e) => (e.key === "Enter" ? handleSelect(opt.id) : undefined)}
                            >
                                <span className="cs-dd-item-label">{opt.label}</span>
                                {active && <span className="cs-dd-check" aria-hidden>✓</span>}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default PersonaDropdown;