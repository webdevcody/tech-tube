import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Tag } from "lucide-react";
import { Input } from "~/components/ui/input";
import { searchTagsQuery } from "~/queries/videos";
import { cn } from "~/lib/utils";

interface TagAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  className?: string;
}

export function TagAutocomplete({
  value,
  onChange,
  onKeyDown,
  placeholder = "Filter by tag...",
  className,
}: TagAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const { data: tags = [], isLoading } = useQuery({
    ...searchTagsQuery(value, 10),
    enabled: isOpen && value.length >= 0,
  });

  useEffect(() => {
    if (tags.length > 0 && selectedIndex >= tags.length) {
      setSelectedIndex(tags.length - 1);
    }
  }, [tags.length, selectedIndex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => setIsOpen(false), 150);
  };

  const handleSelectTag = (tagName: string) => {
    onChange(tagName);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || tags.length === 0) {
      onKeyDown?.(e);
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < tags.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : tags.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < tags.length) {
          handleSelectTag(tags[selectedIndex].name);
        } else {
          onKeyDown?.(e);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
      default:
        onKeyDown?.(e);
        break;
    }
  };

  useEffect(() => {
    if (isOpen && selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex, isOpen]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className={cn("pl-10", className)}
          autoComplete="off"
        />
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1">
          <div className="bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
            {isLoading ? (
              <div className="p-3 text-sm text-muted-foreground text-center">
                Loading tags...
              </div>
            ) : tags.length > 0 ? (
              <ul ref={listRef} className="py-1">
                {tags.map((tag, index) => (
                  <li
                    key={tag.id}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      selectedIndex === index && "bg-accent text-accent-foreground"
                    )}
                    onClick={() => handleSelectTag(tag.name)}
                  >
                    <Tag className="h-3 w-3 text-muted-foreground" />
                    <span>{tag.name}</span>
                    {tag.description && (
                      <span className="text-xs text-muted-foreground ml-auto">
                        {tag.description}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : value ? (
              <div className="p-3 text-sm text-muted-foreground text-center">
                No tags found matching "{value}"
              </div>
            ) : (
              <div className="p-3 text-sm text-muted-foreground text-center">
                Start typing to search tags...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}