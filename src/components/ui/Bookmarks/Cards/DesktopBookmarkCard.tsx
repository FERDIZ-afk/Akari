"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Bookmark } from "@/app/api/interfaces";
import LatestChapterInfo from "../LatestChapterInfo";
import { getButtonInfo } from "@/lib/bookmarks";
import { imageUrl } from "@/lib/utils";
import { ChevronsUpDownIcon, Loader2Icon } from "lucide-react";
import { useRef, useState } from "react";
import { ChaptersPopup } from "../ChaptersPopup";
import { ConfirmDialogs } from "./ConfirmDialogs";

interface Chapter {
    id: string;
    name: string;
    path: string;
    view: string;
    createdAt: string;
}

const DesktopBookmarkCard: React.FC<{
    bookmark: Bookmark;
    setUpdatedBookmarks: React.Dispatch<React.SetStateAction<Bookmark[]>>;
}> = ({ bookmark, setUpdatedBookmarks }) => {
    const {
        mangaIdentifier,
        continueReading,
        continueReadingText,
        buttonColor,
    } = getButtonInfo(bookmark);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
    const buttonRef = useRef<HTMLButtonElement>(
        null!,
    ) as React.RefObject<HTMLButtonElement>;

    async function showChapters() {
        if (!mangaIdentifier) return;

        const newShowState = !showPopup;
        setShowPopup(!showPopup);
        if (newShowState && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;

            // Check if popup would extend beyond the right edge
            const popupWidth = 140;
            const idealLeft = rect.right;
            const adjustedLeft = Math.min(
                idealLeft,
                viewportWidth - popupWidth - 20,
            ); // 20px safety margin

            setPopupPosition({ top: rect.bottom, left: adjustedLeft });
        }

        if (chapters.length === 0 && !showPopup) {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/manga/${mangaIdentifier}`);
                const mangaData = await response.json();
                setChapters(mangaData.data.chapterList);
            } catch (error) {
                console.error("Error loading chapters:", error);
            } finally {
                setIsLoading(false);
            }
        }
    }

    return (
        <Card className="hidden md:flex flex-row items-start p-6 pr-2 shadow-lg bg-card border border-border rounded-lg xl:h-full">
            <div className="w-30 lg:w-40 h-full mb-0 shrink-0">
                <Link
                    href={`/manga/${mangaIdentifier}`}
                    rel="noopener noreferrer"
                    className="block"
                    prefetch={false}
                >
                    <Image
                        src={imageUrl(bookmark.image)}
                        alt={bookmark.storyname}
                        width={300}
                        height={450}
                        className="w-full h-auto object-cover rounded"
                    />
                </Link>
            </div>
            <CardContent className="px-4 flex flex-col flex-shrink justify-between relative w-full">
                <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-top gap-2 mb-2 w-full justify-between">
                        <Link
                            href={`/manga/${mangaIdentifier}`}
                            prefetch={false}
                        >
                            <h3 className="font-bold text-2xl hover:underline text-left text-ellipsis">
                                {bookmark.storyname}
                            </h3>
                        </Link>
                        <ConfirmDialogs
                            bookmark={bookmark}
                            setUpdatedBookmarks={setUpdatedBookmarks}
                        />
                    </div>
                    <div className="flex flex-row gap-2 mb-1">
                        {/* Continue Reading Button */}
                        <Link
                            href={`/manga/${mangaIdentifier}/${continueReading.split("/").pop()}`}
                            rel="noopener noreferrer"
                            className="block w-fit"
                            prefetch={false}
                        >
                            <Button
                                className={`py-4 px-6 text-lg font-bold text-white ${buttonColor} transition-colors`}
                            >
                                <span className="hidden lg:inline lg:mr-1.5">
                                    {continueReadingText.split("-")[0]}
                                </span>
                                <span>{continueReadingText.split("-")[1]}</span>
                            </Button>
                        </Link>
                        <Button
                            ref={buttonRef}
                            className="w-10 p-0"
                            onClick={showChapters}
                            disabled={isLoading}
                        >
                            {isLoading && !showPopup ? (
                                <Loader2Icon className="h-4 w-4 animate-spin" />
                            ) : (
                                <ChevronsUpDownIcon className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                    {LatestChapterInfo({ bookmark, colors: buttonColor })}

                    {showPopup && (
                        <ChaptersPopup
                            chapters={chapters}
                            onClose={() => setShowPopup(false)}
                            mangaIdentifier={mangaIdentifier || ""}
                            isLoading={isLoading}
                            lastReadChapter={bookmark.chapter_numbernow}
                            position={popupPosition}
                            buttonRef={buttonRef} // Pass the button ref
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default DesktopBookmarkCard;
