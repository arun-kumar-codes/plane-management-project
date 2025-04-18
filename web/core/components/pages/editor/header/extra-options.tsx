"use client";

import { observer } from "mobx-react";
// constants
import { IS_FAVORITE_MENU_OPEN } from "@plane/constants";
// editor
import { EditorRefApi } from "@plane/editor";
// plane hooks
import { useLocalStorage } from "@plane/hooks";
// ui
import { ArchiveIcon, FavoriteStar, setToast, TOAST_TYPE, Tooltip } from "@plane/ui";
// components
import { LockedComponent } from "@/components/icons/locked-component";
import { PageInfoPopover, PageOptionsDropdown } from "@/components/pages";
// helpers
import { renderFormattedDate } from "@/helpers/date-time.helper";
// hooks
import useOnlineStatus from "@/hooks/use-online-status";
// plane web hooks
import { EPageStoreType } from "@/plane-web/hooks/store";
// store
import { TPageInstance } from "@/store/pages/base-page";

type Props = {
  editorRef: EditorRefApi;
  page: TPageInstance;
  storeType: EPageStoreType;
};

export const PageExtraOptions: React.FC<Props> = observer((props) => {
  const { editorRef, page, storeType } = props;
  // derived values
  const {
    archived_at,
    isContentEditable,
    is_favorite,
    is_locked,
    canCurrentUserFavoritePage,
    addToFavorites,
    removePageFromFavorites,
  } = page;
  // use online status
  const { isOnline } = useOnlineStatus();
  // local storage
  const { setValue: toggleFavoriteMenu, storedValue: isFavoriteMenuOpen } = useLocalStorage<boolean>(
    IS_FAVORITE_MENU_OPEN,
    false
  );
  // favorite handler
  const handleFavorite = () => {
    if (is_favorite) {
      removePageFromFavorites().then(() =>
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: "Success!",
          message: "Page removed from favorites.",
        })
      );
    } else {
      addToFavorites().then(() => {
        if (!isFavoriteMenuOpen) toggleFavoriteMenu(true);
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: "Success!",
          message: "Page added to favorites.",
        });
      });
    }
  };

  return (
    <div className="flex items-center gap-3">
      {is_locked && <LockedComponent />}
      {archived_at && (
        <div className="flex-shrink-0 flex h-7 items-center gap-2 rounded-full bg-blue-500/20 px-3 py-0.5 text-xs font-medium text-blue-500">
          <ArchiveIcon className="flex-shrink-0 size-3" />
          <span>Archived at {renderFormattedDate(archived_at)}</span>
        </div>
      )}
      {isContentEditable && !isOnline && (
        <Tooltip
          tooltipHeading="You are offline."
          tooltipContent="You can continue making changes. They will be synced when you are back online."
        >
          <div className="flex-shrink-0 flex h-7 items-center gap-2 rounded-full bg-custom-background-80 px-3 py-0.5 text-xs font-medium text-custom-text-300">
            <span className="flex-shrink-0 size-1.5 rounded-full bg-custom-text-300" />
            <span>Offline</span>
          </div>
        </Tooltip>
      )}
      {canCurrentUserFavoritePage && (
        <FavoriteStar
          selected={is_favorite}
          onClick={handleFavorite}
          buttonClassName="flex-shrink-0"
          iconClassName="text-custom-text-100"
        />
      )}
      <PageInfoPopover editorRef={editorRef} page={page} />
      <PageOptionsDropdown editorRef={editorRef} page={page} storeType={storeType} />
    </div>
  );
});
