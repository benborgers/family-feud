import { init } from "@instantdb/react";

export const db = init({
  appId: "42ec3864-a70e-482b-9fae-fbce94d18936",
});

export const room = db.room("default_room");

export const SINGLETON_ID = "00000000-0000-0000-0000-000000000000";

export const EVENTS = {
  TOGGLE_THEME_SONG: "toggle_theme_song",
};
