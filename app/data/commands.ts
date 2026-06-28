/* BindForge NW command data. */
export type ConsoleCommand = {
  id: string;
  command: string;
  bindCommand: string;
  aliases: string[];
  params: string;
  category: string;
};

export const consoleCommands = [
  {
    "id": "netgraph",
    "command": "/netgraph",
    "bindCommand": "netgraph",
    "aliases": [],
    "params": "2, 1 or 0",
    "category": "Performance information"
  },
  {
    "id": "showfps",
    "command": "/showfps",
    "bindCommand": "showfps",
    "aliases": [],
    "params": "1 or 0",
    "category": "Performance information"
  },
  {
    "id": "fpsgraph",
    "command": "/fpsgraph",
    "bindCommand": "fpsgraph",
    "aliases": [],
    "params": "1 or 0",
    "category": "Performance information"
  },
  {
    "id": "showmem",
    "command": "/showmem",
    "bindCommand": "showmem",
    "aliases": [],
    "params": "1 or 0",
    "category": "Performance information"
  },
  {
    "id": "gfxsetdefaultfov",
    "command": "/gfxsetdefaultfov",
    "bindCommand": "gfxsetdefaultfov",
    "aliases": [],
    "params": "30 to 150",
    "category": "Performance information"
  },
  {
    "id": "adjustcamyaw",
    "command": "/adjustcamyaw",
    "bindCommand": "adjustcamyaw",
    "aliases": [],
    "params": "-180 to 180",
    "category": "Performance information"
  },
  {
    "id": "adjustcampitch",
    "command": "/adjustcampitch",
    "bindCommand": "adjustcampitch",
    "aliases": [],
    "params": "-180 to 180",
    "category": "Performance information"
  },
  {
    "id": "bind",
    "command": "/bind",
    "bindCommand": "bind",
    "aliases": [],
    "params": "keybind /command",
    "category": "Performance information"
  },
  {
    "id": "showdevui",
    "command": "/showdevui",
    "bindCommand": "showdevui",
    "aliases": [],
    "params": "1 or 0",
    "category": "Performance information"
  },
  {
    "id": "hide",
    "command": "/hide",
    "bindCommand": "hide",
    "aliases": [],
    "params": "",
    "category": "Status"
  },
  {
    "id": "unhide",
    "command": "/unhide",
    "bindCommand": "unhide",
    "aliases": [],
    "params": "",
    "category": "Status"
  },
  {
    "id": "friendsonly",
    "command": "/friendsonly",
    "bindCommand": "friendsonly",
    "aliases": [],
    "params": "",
    "category": "Status"
  },
  {
    "id": "away",
    "command": "/away",
    "bindCommand": "away",
    "aliases": [
      "/afk"
    ],
    "params": "<string>",
    "category": "Status"
  },
  {
    "id": "unaway",
    "command": "/unaway",
    "bindCommand": "unaway",
    "aliases": [
      "/afk",
      "/away"
    ],
    "params": "",
    "category": "Status"
  },
  {
    "id": "team",
    "command": "/Team",
    "bindCommand": "Team",
    "aliases": [],
    "params": "<string>",
    "category": "Team"
  },
  {
    "id": "team_acceptinvite",
    "command": "/Team_AcceptInvite",
    "bindCommand": "Team_AcceptInvite",
    "aliases": [],
    "params": "",
    "category": "Team"
  },
  {
    "id": "team_acceptrequest",
    "command": "/Team_AcceptRequest",
    "bindCommand": "Team_AcceptRequest",
    "aliases": [],
    "params": "<int>",
    "category": "Team"
  },
  {
    "id": "team_cancelrequest",
    "command": "/Team_CancelRequest",
    "bindCommand": "Team_CancelRequest",
    "aliases": [],
    "params": "",
    "category": "Team"
  },
  {
    "id": "team_declineinvite",
    "command": "/Team_DeclineInvite",
    "bindCommand": "Team_DeclineInvite",
    "aliases": [],
    "params": "",
    "category": "Team"
  },
  {
    "id": "team_declinerequest",
    "command": "/Team_DeclineRequest",
    "bindCommand": "Team_DeclineRequest",
    "aliases": [],
    "params": "<int>",
    "category": "Team"
  },
  {
    "id": "team_invite",
    "command": "/Team_Invite",
    "bindCommand": "Team_Invite",
    "aliases": [],
    "params": "<string>",
    "category": "Team"
  },
  {
    "id": "team_kick",
    "command": "/Team_Kick",
    "bindCommand": "Team_Kick",
    "aliases": [],
    "params": "<string>",
    "category": "Team"
  },
  {
    "id": "team_leave",
    "command": "/Team_Leave",
    "bindCommand": "Team_Leave",
    "aliases": [],
    "params": "",
    "category": "Team"
  },
  {
    "id": "team_mode",
    "command": "/Team_Mode",
    "bindCommand": "Team_Mode",
    "aliases": [],
    "params": "<string>",
    "category": "Team"
  },
  {
    "id": "team_promote",
    "command": "/Team_Promote",
    "bindCommand": "Team_Promote",
    "aliases": [],
    "params": "<string>",
    "category": "Team"
  },
  {
    "id": "team_request",
    "command": "/Team_Request",
    "bindCommand": "Team_Request",
    "aliases": [],
    "params": "<string>",
    "category": "Team"
  },
  {
    "id": "team_setlootmode",
    "command": "/Team_SetLootMode",
    "bindCommand": "Team_SetLootMode",
    "aliases": [],
    "params": "<string>",
    "category": "Team"
  },
  {
    "id": "team_setlootmodequality",
    "command": "/Team_SetLootModeQuality",
    "bindCommand": "Team_SetLootModeQuality",
    "aliases": [],
    "params": "<string>",
    "category": "Team"
  },
  {
    "id": "team_setsidekicking",
    "command": "/Team_SetSidekicking",
    "bindCommand": "Team_SetSidekicking",
    "aliases": [],
    "params": "<int>",
    "category": "Team"
  },
  {
    "id": "screen",
    "command": "/screen",
    "bindCommand": "screen",
    "aliases": [],
    "params": "<integer> <integer>",
    "category": "Miscellaneous"
  },
  {
    "id": "maxfps",
    "command": "/maxfps",
    "bindCommand": "maxfps",
    "aliases": [],
    "params": "<integer>",
    "category": "Miscellaneous"
  },
  {
    "id": "screenshot_depth",
    "command": "/screenshot_depth",
    "bindCommand": "screenshot_depth",
    "aliases": [],
    "params": "Unknown",
    "category": "Miscellaneous"
  },
  {
    "id": "screenshot_jpg",
    "command": "/screenshot_jpg",
    "bindCommand": "screenshot_jpg",
    "aliases": [],
    "params": "",
    "category": "Miscellaneous"
  },
  {
    "id": "screenshot_ui_jpg",
    "command": "/screenshot_ui_jpg",
    "bindCommand": "screenshot_ui_jpg",
    "aliases": [],
    "params": "",
    "category": "Miscellaneous"
  },
  {
    "id": "demo_record",
    "command": "/demo_record",
    "bindCommand": "demo_record",
    "aliases": [],
    "params": "<filename>",
    "category": "Miscellaneous"
  },
  {
    "id": "demo_record_stop",
    "command": "/demo_record_stop",
    "bindCommand": "demo_record_stop",
    "aliases": [],
    "params": "",
    "category": "Miscellaneous"
  },
  {
    "id": "targetcursororautoattack",
    "command": "/targetCursorOrAutoAttack",
    "bindCommand": "targetCursorOrAutoAttack",
    "aliases": [],
    "params": "",
    "category": "Miscellaneous"
  },
  {
    "id": "target_highlight",
    "command": "/target_highlight",
    "bindCommand": "target_highlight",
    "aliases": [],
    "params": "1 or 0",
    "category": "Miscellaneous"
  },
  {
    "id": "target",
    "command": "/target",
    "bindCommand": "target",
    "aliases": [],
    "params": "<string>",
    "category": "Miscellaneous"
  },
  {
    "id": "follow",
    "command": "/follow",
    "bindCommand": "follow",
    "aliases": [],
    "params": "",
    "category": "Miscellaneous"
  },
  {
    "id": "stuck",
    "command": "/stuck",
    "bindCommand": "stuck",
    "aliases": [
      "/unstuck"
    ],
    "params": "",
    "category": "Miscellaneous"
  },
  {
    "id": "killme",
    "command": "/killme",
    "bindCommand": "killme",
    "aliases": [],
    "params": "",
    "category": "Miscellaneous"
  },
  {
    "id": "inventory",
    "command": "/inventory",
    "bindCommand": "inventory",
    "aliases": [],
    "params": "",
    "category": "Miscellaneous"
  },
  {
    "id": "walk",
    "command": "/walk",
    "bindCommand": "walk",
    "aliases": [],
    "params": "1 or 0",
    "category": "Miscellaneous"
  },
  {
    "id": "loc_vec",
    "command": "/loc_vec",
    "bindCommand": "loc_vec",
    "aliases": [],
    "params": "",
    "category": "Miscellaneous"
  },
  {
    "id": "gotocharacterselect",
    "command": "/gotocharacterselect",
    "bindCommand": "gotocharacterselect",
    "aliases": [],
    "params": "",
    "category": "Miscellaneous"
  },
  {
    "id": "ugcshowreviewgen",
    "command": "/ugcshowreviewgen",
    "bindCommand": "ugcshowreviewgen",
    "aliases": [],
    "params": "",
    "category": "Miscellaneous"
  },
  {
    "id": "targetcursor",
    "command": "/targetCursor",
    "bindCommand": "targetCursor",
    "aliases": [],
    "params": "",
    "category": "Miscellaneous"
  },
  {
    "id": "showgameui",
    "command": "/ShowGameUI",
    "bindCommand": "ShowGameUI",
    "aliases": [],
    "params": "1 or 0",
    "category": "Miscellaneous"
  },
  {
    "id": "combatlog",
    "command": "/CombatLog",
    "bindCommand": "CombatLog",
    "aliases": [],
    "params": "1 or 0",
    "category": "Miscellaneous"
  },
  {
    "id": "assist",
    "command": "/assist",
    "bindCommand": "assist",
    "aliases": [],
    "params": "<string>",
    "category": "Unknown"
  },
  {
    "id": "lootcancel",
    "command": "/LootCancel",
    "bindCommand": "LootCancel",
    "aliases": [],
    "params": "",
    "category": "Unknown"
  },
  {
    "id": "roll",
    "command": "/roll",
    "bindCommand": "roll",
    "aliases": [],
    "params": "",
    "category": "Unknown"
  },
  {
    "id": "run",
    "command": "/run",
    "bindCommand": "run",
    "aliases": [],
    "params": "<integer>",
    "category": "Unknown"
  },
  {
    "id": "setfollow",
    "command": "/SetFollow",
    "bindCommand": "SetFollow",
    "aliases": [],
    "params": "<integer>",
    "category": "Unknown"
  },
  {
    "id": "invite",
    "command": "/Invite",
    "bindCommand": "Invite",
    "aliases": [],
    "params": "character@name",
    "category": "Unknown"
  },
  {
    "id": "clevel",
    "command": "/clevel",
    "bindCommand": "clevel",
    "aliases": [],
    "params": "<string> <int> <int>",
    "category": "Unknown"
  },
  {
    "id": "toggledefaultautoattack",
    "command": "/ToggleDefaultAutoAttack",
    "bindCommand": "ToggleDefaultAutoAttack",
    "aliases": [],
    "params": "",
    "category": "Unknown"
  },
  {
    "id": "buy_powertreenode",
    "command": "/Buy_PowerTreeNode",
    "bindCommand": "Buy_PowerTreeNode",
    "aliases": [],
    "params": "<string> <string>",
    "category": "Unknown"
  },
  {
    "id": "acceptfriend",
    "command": "/AcceptFriend",
    "bindCommand": "AcceptFriend",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "actionbackward",
    "command": "/Actionbackward",
    "bindCommand": "Actionbackward",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "actionforward",
    "command": "/Actionforward",
    "bindCommand": "Actionforward",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "actionleft",
    "command": "/Actionleft",
    "bindCommand": "Actionleft",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "actionright",
    "command": "/Actionright",
    "bindCommand": "Actionright",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "addfriend",
    "command": "/Addfriend",
    "bindCommand": "Addfriend",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "afk",
    "command": "/afk",
    "bindCommand": "afk",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "aim",
    "command": "/aim",
    "bindCommand": "aim",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "alias",
    "command": "/alias",
    "bindCommand": "alias",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "alphaindof",
    "command": "/alphaInDOF",
    "bindCommand": "alphaInDOF",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "anon",
    "command": "/anon",
    "bindCommand": "anon",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "aspectratio",
    "command": "/aspectRatio",
    "bindCommand": "aspectRatio",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "assist",
    "command": "/Assist",
    "bindCommand": "Assist",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "autoenableframeratestabilizer",
    "command": "/autoEnableFrameRateStabilizer",
    "bindCommand": "autoEnableFrameRateStabilizer",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "autoforward",
    "command": "/autoForward",
    "bindCommand": "autoForward",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "autoforward1",
    "command": "/autoForward1",
    "bindCommand": "autoForward1",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "back",
    "command": "/back",
    "bindCommand": "back",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "backward",
    "command": "/backward",
    "bindCommand": "backward",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "backward1",
    "command": "/backward1",
    "bindCommand": "backward1",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "befriend",
    "command": "/Befriend",
    "bindCommand": "Befriend",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "bind_load",
    "command": "/bind_load",
    "bindCommand": "bind_load",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "bind_load_file",
    "command": "/bind_load_file",
    "bindCommand": "bind_load_file",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "bind_local",
    "command": "/bind_local",
    "bindCommand": "bind_local",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "bind_local_load",
    "command": "/bind_local_load",
    "bindCommand": "bind_local_load",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "bind_local_load_file",
    "command": "/bind_local_load_file",
    "bindCommand": "bind_local_load_file",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "bind_local_save",
    "command": "/bind_local_save",
    "bindCommand": "bind_local_save",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "bind_local_save_file",
    "command": "/bind_local_save_file",
    "bindCommand": "bind_local_save_file",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "bind_pop_profile",
    "command": "/bind_pop_profile",
    "bindCommand": "bind_pop_profile",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "bind_push_profile",
    "command": "/bind_push_profile",
    "bindCommand": "bind_push_profile",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "bind_save",
    "command": "/bind_save",
    "bindCommand": "bind_save",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "bind_save_file",
    "command": "/bind_save_file",
    "bindCommand": "bind_save_file",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "blacksmith",
    "command": "/Blacksmith",
    "bindCommand": "Blacksmith",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "bloomquality",
    "command": "/bloomQuality",
    "bindCommand": "bloomQuality",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "bow",
    "command": "/Bow",
    "bindCommand": "Bow",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "bug",
    "command": "/bug",
    "bindCommand": "bug",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "bye",
    "command": "/Bye",
    "bindCommand": "Bye",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "c",
    "command": "/c",
    "bindCommand": "c",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "caccess",
    "command": "/caccess",
    "bindCommand": "caccess",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "calendar",
    "command": "/Calendar",
    "bindCommand": "Calendar",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "cambutton_target_lock_toggle",
    "command": "/camButton_Target_Lock_Toggle",
    "bindCommand": "camButton_Target_Lock_Toggle",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "camsetlocktotarget",
    "command": "/Camsetlocktotarget",
    "bindCommand": "Camsetlocktotarget",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "camuseautotargetlock",
    "command": "/camUseAutoTargetLock",
    "bindCommand": "camUseAutoTargetLock",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "camzoomin",
    "command": "/Camzoomin",
    "bindCommand": "Camzoomin",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "camzoomout",
    "command": "/Camzoomout",
    "bindCommand": "Camzoomout",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "chan",
    "command": "/chan",
    "bindCommand": "chan",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "chanaccess",
    "command": "/chanaccess",
    "bindCommand": "chanaccess",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "chandemote",
    "command": "/chandemote",
    "bindCommand": "chandemote",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "changeinstance",
    "command": "/ChangeInstance",
    "bindCommand": "ChangeInstance",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "chaninvite",
    "command": "/chaninvite",
    "bindCommand": "chaninvite",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "channel_access",
    "command": "/channel_access",
    "bindCommand": "channel_access",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "channel_create",
    "command": "/channel_create",
    "bindCommand": "channel_create",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "channel_decline_invite",
    "command": "/channel_decline_invite",
    "bindCommand": "channel_decline_invite",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "channel_description",
    "command": "/channel_description",
    "bindCommand": "channel_description",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "channel_destroy",
    "command": "/channel_destroy",
    "bindCommand": "channel_destroy",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "channel_info",
    "command": "/channel_info",
    "bindCommand": "channel_info",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "channel_invite",
    "command": "/channel_invite",
    "bindCommand": "channel_invite",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "channel_join",
    "command": "/channel_join",
    "bindCommand": "channel_join",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "channel_kick",
    "command": "/channel_kick",
    "bindCommand": "channel_kick",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "channel_leave",
    "command": "/channel_leave",
    "bindCommand": "channel_leave",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "channel_motd",
    "command": "/channel_motd",
    "bindCommand": "channel_motd",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "channel_refreshadmindetail",
    "command": "/Channel_RefreshAdminDetail",
    "bindCommand": "Channel_RefreshAdminDetail",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "channel_refreshjoindetail",
    "command": "/Channel_RefreshJoinDetail",
    "bindCommand": "Channel_RefreshJoinDetail",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "channel_refreshsummary",
    "command": "/Channel_RefreshSummary",
    "bindCommand": "Channel_RefreshSummary",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "channel_setcurrent",
    "command": "/channel_setcurrent",
    "bindCommand": "channel_setcurrent",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "channel_uninvite",
    "command": "/channel_uninvite",
    "bindCommand": "channel_uninvite",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "channelsend",
    "command": "/ChannelSend",
    "bindCommand": "ChannelSend",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "chanpromote",
    "command": "/chanpromote",
    "bindCommand": "chanpromote",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "characterdetail",
    "command": "/CharacterDetail",
    "bindCommand": "CharacterDetail",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "chat",
    "command": "/Chat",
    "bindCommand": "Chat",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "chat_setstatus",
    "command": "/Chat_SetStatus",
    "bindCommand": "Chat_SetStatus",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "chatfriendsonly",
    "command": "/ChatFriendsOnly",
    "bindCommand": "ChatFriendsOnly",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "chathidden",
    "command": "/ChatHidden",
    "bindCommand": "ChatHidden",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "chatvisible",
    "command": "/ChatVisible",
    "bindCommand": "ChatVisible",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "cinvite",
    "command": "/cinvite",
    "bindCommand": "cinvite",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "clear",
    "command": "/Clear",
    "bindCommand": "Clear",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "cleartargetorbringupmenu",
    "command": "/ClearTargetOrBringUpMenu",
    "bindCommand": "ClearTargetOrBringUpMenu",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "cleartargetorbringupmenuignoremouselook",
    "command": "/ClearTargetOrBringUpMenuIgnoreMouseLook",
    "bindCommand": "ClearTargetOrBringUpMenuIgnoreMouseLook",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "clickwindowbutton_1",
    "command": "/Clickwindowbutton_1",
    "bindCommand": "Clickwindowbutton_1",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "clickwindowbutton_2",
    "command": "/Clickwindowbutton_2",
    "bindCommand": "Clickwindowbutton_2",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "clickwindowbutton_3",
    "command": "/Clickwindowbutton_3",
    "bindCommand": "Clickwindowbutton_3",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "cmdlist",
    "command": "/cmdlist",
    "bindCommand": "cmdlist",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "cmds",
    "command": "/cmds",
    "bindCommand": "cmds",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "combatpowerstatecyclenext",
    "command": "/CombatPowerStateCycleNext",
    "bindCommand": "CombatPowerStateCycleNext",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "combatreactivepowerexec",
    "command": "/CombatReactivePowerExec",
    "bindCommand": "CombatReactivePowerExec",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "comicshading",
    "command": "/comicShading",
    "bindCommand": "comicShading",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "contactdialogend",
    "command": "/ContactDialogEnd",
    "bindCommand": "ContactDialogEnd",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "crafting",
    "command": "/Crafting",
    "bindCommand": "Crafting",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "create",
    "command": "/create",
    "bindCommand": "create",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "credits",
    "command": "/Credits",
    "bindCommand": "Credits",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "cstore",
    "command": "/Cstore",
    "bindCommand": "Cstore",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "cursorclick",
    "command": "/cursorClick",
    "bindCommand": "cursorClick",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "cursorpetrally_beginplaceforentity",
    "command": "/CursorPetRally_BeginPlaceForEntity",
    "bindCommand": "CursorPetRally_BeginPlaceForEntity",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "cursorpetrally_beginplaceforteam",
    "command": "/CursorPetRally_BeginPlaceForTeam",
    "bindCommand": "CursorPetRally_BeginPlaceForTeam",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "d3d11",
    "command": "/d3d11",
    "bindCommand": "d3d11",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "d3d9",
    "command": "/d3d9",
    "bindCommand": "d3d9",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "d3d9ex",
    "command": "/d3d9ex",
    "bindCommand": "d3d9ex",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "dance",
    "command": "/Dance",
    "bindCommand": "Dance",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "defaultautoattack",
    "command": "/DefaultAutoAttack",
    "bindCommand": "DefaultAutoAttack",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "demo_restart",
    "command": "/demo_restart",
    "bindCommand": "demo_restart",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "devicetype",
    "command": "/deviceType",
    "bindCommand": "deviceType",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "disable_3d_texture_flush",
    "command": "/disable_3d_texture_flush",
    "bindCommand": "disable_3d_texture_flush",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "disable_multimon_warning",
    "command": "/disable_multimon_warning",
    "bindCommand": "disable_multimon_warning",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "disable_windowed_fullscreen",
    "command": "/disable_windowed_fullscreen",
    "bindCommand": "disable_windowed_fullscreen",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "disableautoalwaysontop",
    "command": "/disableAutoAlwaysOnTop",
    "bindCommand": "disableAutoAlwaysOnTop",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "disablecursormode",
    "command": "/DisableCursorMode",
    "bindCommand": "DisableCursorMode",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "disablemrt",
    "command": "/disableMRT",
    "bindCommand": "disableMRT",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "disablerallypointfx",
    "command": "/DisableRallyPointFX",
    "bindCommand": "DisableRallyPointFX",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "disablesplatshadows",
    "command": "/disableSplatShadows",
    "bindCommand": "disableSplatShadows",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "dnd",
    "command": "/dnd",
    "bindCommand": "dnd",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "dof",
    "command": "/dof",
    "bindCommand": "dof",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "doftoggle",
    "command": "/dofToggle",
    "bindCommand": "dofToggle",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "down",
    "command": "/down",
    "bindCommand": "down",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "down1",
    "command": "/down1",
    "bindCommand": "down1",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "dropmission",
    "command": "/Dropmission",
    "bindCommand": "Dropmission",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "dynamiclights",
    "command": "/dynamicLights",
    "bindCommand": "dynamicLights",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "dynfxdumpexcludedfx",
    "command": "/dynFxDumpExcludedFX",
    "bindCommand": "dynFxDumpExcludedFX",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "dynfxexcludefx",
    "command": "/dynFxExcludeFX",
    "bindCommand": "dynFxExcludeFX",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "dynfxsetfxexlusionlist",
    "command": "/dynFxSetFXExlusionList",
    "bindCommand": "dynFxSetFXExlusionList",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "e",
    "command": "/e",
    "bindCommand": "e",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "em",
    "command": "/em",
    "bindCommand": "em",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "em-save",
    "command": "/EM.Save",
    "bindCommand": "EM.Save",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "emote",
    "command": "/emote",
    "bindCommand": "emote",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "emote_notext",
    "command": "/emote_notext",
    "bindCommand": "emote_notext",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "entcmd_cancelupgradejob",
    "command": "/entCmd_CancelUpgradeJob",
    "bindCommand": "entCmd_CancelUpgradeJob",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "entitytexlodlevel",
    "command": "/entityTexLODLevel",
    "bindCommand": "entityTexLODLevel",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "evaluateleftclick",
    "command": "/EvaluateLeftClick",
    "bindCommand": "EvaluateLeftClick",
    "aliases": [
      "/EvaluateLeftClick 1 - start autoattack left mouse. /EvaluateLeftClick 0 - stop autoattack left mouse."
    ],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "execactiveitempowerinbag",
    "command": "/ExecActiveItemPowerInBag",
    "bindCommand": "ExecActiveItemPowerInBag",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "exportguildmemberlist-filename-csv-",
    "command": "/ExportGuildMemberList <filename.csv>",
    "bindCommand": "ExportGuildMemberList <filename.csv>",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "exportguilddonationlog",
    "command": "/ExportGuildDonationLog",
    "bindCommand": "ExportGuildDonationLog",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "findteams",
    "command": "/findteams",
    "bindCommand": "findteams",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "focus",
    "command": "/Focus",
    "bindCommand": "Focus",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "follow",
    "command": "/Follow",
    "bindCommand": "Follow",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "follow_cancel",
    "command": "/Follow_Cancel",
    "bindCommand": "Follow_Cancel",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "follow_resume",
    "command": "/Follow_Resume",
    "bindCommand": "Follow_Resume",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "followuntilincombatorinrange",
    "command": "/FollowUntilInCombatOrInRange",
    "bindCommand": "FollowUntilInCombatOrInRange",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "forcelogout",
    "command": "/ForceLogOut",
    "bindCommand": "ForceLogOut",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "forceoffscreenrendering",
    "command": "/forceOffScreenRendering",
    "bindCommand": "forceOffScreenRendering",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "forward",
    "command": "/forward",
    "bindCommand": "forward",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "forward1",
    "command": "/forward1",
    "bindCommand": "forward1",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "foundrytips_withdraw",
    "command": "/FoundryTips_Withdraw",
    "bindCommand": "FoundryTips_Withdraw",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "fpshisto",
    "command": "/fpshisto",
    "bindCommand": "fpshisto",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "frameratestabilizer",
    "command": "/frameRateStabilizer",
    "bindCommand": "frameRateStabilizer",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "freemousecursor",
    "command": "/freeMouseCursor",
    "bindCommand": "freeMouseCursor",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "friend",
    "command": "/friend",
    "bindCommand": "friend",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "friendadd",
    "command": "/Friendadd",
    "bindCommand": "Friendadd",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "friendcomment",
    "command": "/FriendComment",
    "bindCommand": "FriendComment",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "friends",
    "command": "/Friends",
    "bindCommand": "Friends",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "friendsonly",
    "command": "/FriendsOnly",
    "bindCommand": "FriendsOnly",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "fxquality",
    "command": "/fxQuality",
    "bindCommand": "fxQuality",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "g",
    "command": "/g",
    "bindCommand": "g",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "gamemenu",
    "command": "/GameMenu",
    "bindCommand": "GameMenu",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "gamma",
    "command": "/gamma",
    "bindCommand": "gamma",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "gammacalibration_reset",
    "command": "/GammaCalibration_Reset",
    "bindCommand": "GammaCalibration_Reset",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "gateway_sethidden",
    "command": "/gateway_SetHidden",
    "bindCommand": "gateway_SetHidden",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "gatewayinventory_discarditem",
    "command": "/GatewayInventory_DiscardItem",
    "bindCommand": "GatewayInventory_DiscardItem",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "gatewayinventory_openrewardpack",
    "command": "/GatewayInventory_OpenRewardPack",
    "bindCommand": "GatewayInventory_OpenRewardPack",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "gatewayinventory_sortbag",
    "command": "/GatewayInventory_SortBag",
    "bindCommand": "GatewayInventory_SortBag",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "gclautoattack_defaultautoattack",
    "command": "/gclAutoAttack_DefaultAutoAttack",
    "bindCommand": "gclAutoAttack_DefaultAutoAttack",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "genaddmodal",
    "command": "/GenAddModal",
    "bindCommand": "GenAddModal",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "genaddwindow",
    "command": "/GenAddWindow",
    "bindCommand": "GenAddWindow",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "genaddwindowpcxbox",
    "command": "/GenAddWindowPCXbox",
    "bindCommand": "GenAddWindowPCXbox",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "genbuttonclick",
    "command": "/GenButtonClick",
    "bindCommand": "GenButtonClick",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "gencyclefocus",
    "command": "/GenCycleFocus",
    "bindCommand": "GenCycleFocus",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "gencyclefocusreverse",
    "command": "/GenCycleFocusReverse",
    "bindCommand": "GenCycleFocusReverse",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "genjailreset",
    "command": "/GenJailReset",
    "bindCommand": "GenJailReset",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "genjailsink",
    "command": "/GenJailSink",
    "bindCommand": "GenJailSink",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "genlistactivate",
    "command": "/GenListActivate",
    "bindCommand": "GenListActivate",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "genlistdoselectedcallback",
    "command": "/GenListDoSelectedCallback",
    "bindCommand": "GenListDoSelectedCallback",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "genlistdown",
    "command": "/GenListDown",
    "bindCommand": "GenListDown",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "genlistup",
    "command": "/GenListUp",
    "bindCommand": "GenListUp",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "genmovableboxresetallpositions",
    "command": "/GenMovableBoxResetAllPositions",
    "bindCommand": "GenMovableBoxResetAllPositions",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "genmovableboxresetposition",
    "command": "/GenMovableBoxResetPosition",
    "bindCommand": "GenMovableBoxResetPosition",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "genprisonhide",
    "command": "/GenPrisonHide",
    "bindCommand": "GenPrisonHide",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "genprisonshow",
    "command": "/GenPrisonShow",
    "bindCommand": "GenPrisonShow",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "genremovemodal",
    "command": "/GenRemoveModal",
    "bindCommand": "GenRemoveModal",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "genremovewindow",
    "command": "/GenRemoveWindow",
    "bindCommand": "GenRemoveWindow",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "genremovewindowpcxbox",
    "command": "/GenRemoveWindowPCXbox",
    "bindCommand": "GenRemoveWindowPCXbox",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "gensendmessage",
    "command": "/GenSendMessage",
    "bindCommand": "GenSendMessage",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "gensetfocus",
    "command": "/GenSetFocus",
    "bindCommand": "GenSetFocus",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "gensetfocusoncreate",
    "command": "/GenSetFocusOnCreate",
    "bindCommand": "GenSetFocusOnCreate",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "gensettext",
    "command": "/GenSetText",
    "bindCommand": "GenSetText",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "gensettooltipfocus",
    "command": "/GenSetTooltipFocus",
    "bindCommand": "GenSetTooltipFocus",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "gensetvalue",
    "command": "/GenSetValue",
    "bindCommand": "GenSetValue",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "genslideradjustnotch",
    "command": "/GenSliderAdjustNotch",
    "bindCommand": "GenSliderAdjustNotch",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "genslideradjustvalue",
    "command": "/GenSliderAdjustValue",
    "bindCommand": "GenSliderAdjustValue",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "genslidersetnotch",
    "command": "/GenSliderSetNotch",
    "bindCommand": "GenSliderSetNotch",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "genslidersetvalue",
    "command": "/GenSliderSetValue",
    "bindCommand": "GenSliderSetValue",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "gfxforceprodmodedefaultsettings",
    "command": "/gfxForceProdModeDefaultSettings",
    "bindCommand": "gfxForceProdModeDefaultSettings",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "gfxsettingssetminimaloptions",
    "command": "/gfxSettingsSetMinimalOptions",
    "bindCommand": "gfxSettingsSetMinimalOptions",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "gfxtransgamingsetfullscreen",
    "command": "/gfxTransgamingSetFullscreen",
    "bindCommand": "gfxTransgamingSetFullscreen",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "gotocharacterselect",
    "command": "/gotoCharacterSelect",
    "bindCommand": "gotoCharacterSelect",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "gpuacceleratedparticles",
    "command": "/gpuAcceleratedParticles",
    "bindCommand": "gpuAcceleratedParticles",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "group",
    "command": "/Group",
    "bindCommand": "Group",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "gu",
    "command": "/Gu",
    "bindCommand": "Gu",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "guild",
    "command": "/guild",
    "bindCommand": "guild",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "guild_acceptinvite",
    "command": "/Guild_AcceptInvite",
    "bindCommand": "Guild_AcceptInvite",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "guild_declineinvite",
    "command": "/Guild_DeclineInvite",
    "bindCommand": "Guild_DeclineInvite",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "guild_invite",
    "command": "/Guild_Invite",
    "bindCommand": "Guild_Invite",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "guild_kick",
    "command": "/Guild_Kick",
    "bindCommand": "Guild_Kick",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "guild_leave",
    "command": "/Guild_Leave",
    "bindCommand": "Guild_Leave",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "guild_motd",
    "command": "/Guild_MotD",
    "bindCommand": "Guild_MotD",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "guild_setmotd",
    "command": "/Guild_SetMotD",
    "bindCommand": "Guild_SetMotD",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "guildmanagement",
    "command": "/Guildmanagement",
    "bindCommand": "Guildmanagement",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "hardtargetlock",
    "command": "/HardTargetLock",
    "bindCommand": "HardTargetLock",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "hdr_max_luminance_adaptation",
    "command": "/hdr_max_luminance_adaptation",
    "bindCommand": "hdr_max_luminance_adaptation",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "heal",
    "command": "/Heal",
    "bindCommand": "Heal",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "help_tickets",
    "command": "/Help_Tickets",
    "bindCommand": "Help_Tickets",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "hidepowererrors",
    "command": "/Hidepowererrors",
    "bindCommand": "Hidepowererrors",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "highdetail",
    "command": "/highDetail",
    "bindCommand": "highDetail",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "highersettingsintailor",
    "command": "/higherSettingsInTailor",
    "bindCommand": "higherSettingsInTailor",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "highfilldetail",
    "command": "/highFillDetail",
    "bindCommand": "highFillDetail",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "highqualitydof",
    "command": "/highQualityDOF",
    "bindCommand": "highQualityDOF",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "homepage",
    "command": "/Homepage",
    "bindCommand": "Homepage",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "ignore",
    "command": "/ignore",
    "bindCommand": "ignore",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "ignore_spammer",
    "command": "/ignore_spammer",
    "bindCommand": "ignore_spammer",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "interact",
    "command": "/interact",
    "bindCommand": "interact",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "interactandloot",
    "command": "/Interactandloot",
    "bindCommand": "Interactandloot",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "interactcursor",
    "command": "/Interactcursor",
    "bindCommand": "Interactcursor",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "interactincludevolume",
    "command": "/interactIncludeVolume",
    "bindCommand": "interactIncludeVolume",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "interactoptionpower",
    "command": "/interactOptionPower",
    "bindCommand": "interactOptionPower",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "interactoverrideclear",
    "command": "/interactOverrideClear",
    "bindCommand": "interactOverrideClear",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "interactoverridecursor",
    "command": "/interactOverrideCursor",
    "bindCommand": "interactOverrideCursor",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "interactwindow",
    "command": "/Interactwindow",
    "bindCommand": "Interactwindow",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "inventory",
    "command": "/Inventory",
    "bindCommand": "Inventory",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "inventoryexec",
    "command": "/InventoryExec",
    "bindCommand": "InventoryExec",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "invertibledown",
    "command": "/invertibledown",
    "bindCommand": "invertibledown",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "invertibleup",
    "command": "/invertibleup",
    "bindCommand": "invertibleup",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "invertupdown",
    "command": "/invertUpDown",
    "bindCommand": "invertUpDown",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "invertx",
    "command": "/invertX",
    "bindCommand": "invertX",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "inverty",
    "command": "/invertY",
    "bindCommand": "invertY",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "invoke",
    "command": "/Invoke",
    "bindCommand": "Invoke",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "itemupgradeui_setupgradetime",
    "command": "/ItemUpgradeUI_SetUpgradeTime",
    "bindCommand": "ItemUpgradeUI_SetUpgradeTime",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "keybinds",
    "command": "/Keybinds",
    "bindCommand": "Keybinds",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "killme",
    "command": "/Killme",
    "bindCommand": "Killme",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "l",
    "command": "/L",
    "bindCommand": "L",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "laugh",
    "command": "/Laugh",
    "bindCommand": "Laugh",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "left",
    "command": "/left",
    "bindCommand": "left",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "left1",
    "command": "/left1",
    "bindCommand": "left1",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "lensflare_quality",
    "command": "/lensflare_quality",
    "bindCommand": "lensflare_quality",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "levelupwindow",
    "command": "/Levelupwindow",
    "bindCommand": "Levelupwindow",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "lfg",
    "command": "/lfg",
    "bindCommand": "lfg",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "lfg_mode",
    "command": "/LFG_Mode",
    "bindCommand": "LFG_Mode",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "lfgdifficulty_mode",
    "command": "/LFGDifficulty_Mode",
    "bindCommand": "LFGDifficulty_Mode",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "lfm",
    "command": "/Lfm",
    "bindCommand": "Lfm",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "lft",
    "command": "/lft",
    "bindCommand": "lft",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "lightingquality",
    "command": "/lightingQuality",
    "bindCommand": "lightingQuality",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "listcellsize",
    "command": "/ListCellSize",
    "bindCommand": "ListCellSize",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "loc",
    "command": "/loc",
    "bindCommand": "loc",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "local",
    "command": "/local",
    "bindCommand": "local",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "login_back",
    "command": "/Login_Back",
    "bindCommand": "Login_Back",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "logout",
    "command": "/logout",
    "bindCommand": "logout",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "lookdown",
    "command": "/lookDown",
    "bindCommand": "lookDown",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "lookingforgroup",
    "command": "/LookingForGroup",
    "bindCommand": "LookingForGroup",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "lookup",
    "command": "/lookUp",
    "bindCommand": "lookUp",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "lore",
    "command": "/Lore",
    "bindCommand": "Lore",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "macroexec",
    "command": "/MacroExec",
    "bindCommand": "MacroExec",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "macrorun",
    "command": "/MacroRun",
    "bindCommand": "MacroRun",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "mail",
    "command": "/mail",
    "bindCommand": "mail",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "makecostumejpeg",
    "command": "/MakeCostumeJPeg",
    "bindCommand": "MakeCostumeJPeg",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "map",
    "command": "/Map",
    "bindCommand": "Map",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "maxinactivefps",
    "command": "/maxInactiveFps",
    "bindCommand": "maxInactiveFps",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "maxlightsperobject",
    "command": "/maxLightsPerObject",
    "bindCommand": "maxLightsPerObject",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "maxshadowedlights",
    "command": "/maxShadowedLights",
    "bindCommand": "maxShadowedLights",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "me",
    "command": "/me",
    "bindCommand": "me",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "missions",
    "command": "/missions",
    "bindCommand": "missions",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "missiontoggletracked",
    "command": "/Missiontoggletracked",
    "bindCommand": "Missiontoggletracked",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "motd",
    "command": "/motd",
    "bindCommand": "motd",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "mouseforward",
    "command": "/mouseForward",
    "bindCommand": "mouseForward",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "msaa",
    "command": "/msaa",
    "bindCommand": "msaa",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "mute",
    "command": "/mute",
    "bindCommand": "mute",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "mutecontactvo",
    "command": "/Mutecontactvo",
    "bindCommand": "Mutecontactvo",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "navtoposition",
    "command": "/NavToPosition",
    "bindCommand": "NavToPosition",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "navtospawn_receiveposition",
    "command": "/NavToSpawn_ReceivePosition",
    "bindCommand": "NavToSpawn_ReceivePosition",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "nettiminggraph",
    "command": "/netTimingGraph",
    "bindCommand": "netTimingGraph",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "nettiminggraphalpha",
    "command": "/netTimingGraphAlpha",
    "bindCommand": "netTimingGraphAlpha",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "noclipcursor",
    "command": "/noClipCursor",
    "bindCommand": "noClipCursor",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "nocustomcursor",
    "command": "/noCustomCursor",
    "bindCommand": "noCustomCursor",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "nosleepwhilewaitingforgpu",
    "command": "/noSleepWhileWaitingForGPU",
    "bindCommand": "noSleepWhileWaitingForGPU",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "notesservername",
    "command": "/NotesServerName",
    "bindCommand": "NotesServerName",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "o",
    "command": "/O",
    "bindCommand": "O",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "off",
    "command": "/off",
    "bindCommand": "off",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "officer",
    "command": "/officer",
    "bindCommand": "officer",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "openurlcmd",
    "command": "/OpenUrlCmd",
    "bindCommand": "OpenUrlCmd",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "options",
    "command": "/Options",
    "bindCommand": "Options",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "outlining",
    "command": "/outlining",
    "bindCommand": "outlining",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "p",
    "command": "/p",
    "bindCommand": "p",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "paperdoll",
    "command": "/Paperdoll",
    "bindCommand": "Paperdoll",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "party",
    "command": "/Party",
    "bindCommand": "Party",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "pause",
    "command": "/pause",
    "bindCommand": "pause",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "perframesleep",
    "command": "/perFrameSleep",
    "bindCommand": "perFrameSleep",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "perks",
    "command": "/Perks",
    "bindCommand": "Perks",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "pets",
    "command": "/pets",
    "bindCommand": "pets",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "played",
    "command": "/played",
    "bindCommand": "played",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "poissonshadows",
    "command": "/poissonShadows",
    "bindCommand": "poissonShadows",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "postprocessing",
    "command": "/postProcessing",
    "bindCommand": "postProcessing",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "power_exec",
    "command": "/Power_Exec",
    "bindCommand": "Power_Exec",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "power_exec_category",
    "command": "/Power_Exec_Category",
    "bindCommand": "Power_Exec_Category",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "power_exec_neardeath",
    "command": "/Power_Exec_NearDeath",
    "bindCommand": "Power_Exec_NearDeath",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "powerexeccategoryifactivatable",
    "command": "/PowerExecCategoryIfActivatable",
    "bindCommand": "PowerExecCategoryIfActivatable",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "powers",
    "command": "/Powers",
    "bindCommand": "Powers",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "powerslotexec",
    "command": "/PowerSlotExec",
    "bindCommand": "PowerSlotExec",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "powertrayexec",
    "command": "/PowerTrayExec",
    "bindCommand": "PowerTrayExec",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "printstalltimes",
    "command": "/printStallTimes",
    "bindCommand": "printStallTimes",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "process_priority",
    "command": "/process_priority",
    "bindCommand": "process_priority",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "processmessagesonlybetweenframes",
    "command": "/processMessagesOnlyBetweenFrames",
    "bindCommand": "processMessagesOnlyBetweenFrames",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "promote",
    "command": "/Promote",
    "bindCommand": "Promote",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "queue",
    "command": "/Queue",
    "bindCommand": "Queue",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "queue_joinqueuewithprefs",
    "command": "/Queue_JoinQueueWithPrefs",
    "bindCommand": "Queue_JoinQueueWithPrefs",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "quit",
    "command": "/quit",
    "bindCommand": "quit",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "r",
    "command": "/r",
    "bindCommand": "r",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "rdr_debug_max_sync_waits",
    "command": "/rdr_debug_max_sync_waits",
    "bindCommand": "rdr_debug_max_sync_waits",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "rdrdisablesm2b",
    "command": "/rdrDisableSM2B",
    "bindCommand": "rdrDisableSM2B",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "rdrmaxframesahead",
    "command": "/rdrMaxFramesAhead",
    "bindCommand": "rdrMaxFramesAhead",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "rdrmaxgpuframesahead",
    "command": "/rdrMaxGPUFramesAhead",
    "bindCommand": "rdrMaxGPUFramesAhead",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "rearrange",
    "command": "/Rearrange",
    "bindCommand": "Rearrange",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "reduce_mip",
    "command": "/reduce_mip",
    "bindCommand": "reduce_mip",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "rejectfriend",
    "command": "/RejectFriend",
    "bindCommand": "RejectFriend",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "rememberuilists",
    "command": "/RememberUILists",
    "bindCommand": "RememberUILists",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "rememberwindows",
    "command": "/RememberWindows",
    "bindCommand": "RememberWindows",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "removefriend",
    "command": "/RemoveFriend",
    "bindCommand": "RemoveFriend",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "removeignore",
    "command": "/RemoveIgnore",
    "bindCommand": "RemoveIgnore",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "renamepet",
    "command": "/RenamePet",
    "bindCommand": "RenamePet",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "renamepetformal",
    "command": "/RenamePetFormal",
    "bindCommand": "RenamePetFormal",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "renderscale",
    "command": "/renderScale",
    "bindCommand": "renderScale",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "rendersize",
    "command": "/renderSize",
    "bindCommand": "renderSize",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "reply",
    "command": "/reply",
    "bindCommand": "reply",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "replylast",
    "command": "/replyLast",
    "bindCommand": "replyLast",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "request",
    "command": "/Request",
    "bindCommand": "Request",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "resourceoverlayload",
    "command": "/ResourceOverlayLoad",
    "bindCommand": "ResourceOverlayLoad",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "restoregameui",
    "command": "/RestoreGameUI",
    "bindCommand": "RestoreGameUI",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "reversemousebuttons",
    "command": "/reverseMouseButtons",
    "bindCommand": "reverseMouseButtons",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "right",
    "command": "/right",
    "bindCommand": "right",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "right1",
    "command": "/right1",
    "bindCommand": "right1",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "s",
    "command": "/S",
    "bindCommand": "S",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "safelogin",
    "command": "/SafeLogin",
    "bindCommand": "SafeLogin",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "say",
    "command": "/Say",
    "bindCommand": "Say",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "scattering",
    "command": "/scattering",
    "bindCommand": "scattering",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "scoreboard",
    "command": "/Scoreboard",
    "bindCommand": "Scoreboard",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "screen_pos_size",
    "command": "/screen_pos_size",
    "bindCommand": "screen_pos_size",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "screenshot",
    "command": "/screenshot",
    "bindCommand": "screenshot",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "screenshot_ui",
    "command": "/screenshot_ui",
    "bindCommand": "screenshot_ui",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "setactivecostume",
    "command": "/SetActiveCostume",
    "bindCommand": "SetActiveCostume",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "setfocustocurrentchattextentrywindow",
    "command": "/SetFocusToCurrentChatTextEntryWindow",
    "bindCommand": "SetFocusToCurrentChatTextEntryWindow",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "setgamecamyaw",
    "command": "/setGameCamYaw",
    "bindCommand": "setGameCamYaw",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "sethudshowdamagefloaters",
    "command": "/SetHudShowDamageFloaters",
    "bindCommand": "SetHudShowDamageFloaters",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "sethudshowinteractionicons",
    "command": "/SetHudShowInteractionIcons",
    "bindCommand": "SetHudShowInteractionIcons",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "sethudshowplayertitles",
    "command": "/SetHudShowPlayerTitles",
    "bindCommand": "SetHudShowPlayerTitles",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "sethudshowreticlesas",
    "command": "/SetHudShowReticlesAs",
    "bindCommand": "SetHudShowReticlesAs",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "setinvbaghidemode",
    "command": "/SetInvBagHideMode",
    "bindCommand": "SetInvBagHideMode",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "setinvslothidemode",
    "command": "/SetInvSlotHideMode",
    "bindCommand": "SetInvSlotHideMode",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "setmouseforward",
    "command": "/setMouseForward",
    "bindCommand": "setMouseForward",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "shadows",
    "command": "/shadows",
    "bindCommand": "shadows",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "sharemission",
    "command": "/Sharemission",
    "bindCommand": "Sharemission",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "showcampos",
    "command": "/showCamPos",
    "bindCommand": "showCamPos",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "showgameuinoextrakeybinds",
    "command": "/ShowGameUINoExtraKeyBinds",
    "bindCommand": "ShowGameUINoExtraKeyBinds",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "showpowererrors",
    "command": "/Showpowererrors",
    "bindCommand": "Showpowererrors",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "sit",
    "command": "/Sit",
    "bindCommand": "Sit",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "skipcutscene",
    "command": "/SkipCutscene",
    "bindCommand": "SkipCutscene",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "skipfmv",
    "command": "/SkipFMV",
    "bindCommand": "SkipFMV",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "slow",
    "command": "/slow",
    "bindCommand": "slow",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "slow1",
    "command": "/slow1",
    "bindCommand": "slow1",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "snddisable",
    "command": "/sndDisable",
    "bindCommand": "sndDisable",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "sndenable",
    "command": "/sndEnable",
    "bindCommand": "sndEnable",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "social",
    "command": "/Social",
    "bindCommand": "Social",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "soft_particles",
    "command": "/soft_particles",
    "bindCommand": "soft_particles",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "softshadows",
    "command": "/softShadows",
    "bindCommand": "softShadows",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "softwarecursor",
    "command": "/SoftwareCursor",
    "bindCommand": "SoftwareCursor",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "specialclasspower",
    "command": "/specialClassPower",
    "bindCommand": "specialClassPower",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "ssao",
    "command": "/ssao",
    "bindCommand": "ssao",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "startchat",
    "command": "/Startchat",
    "bindCommand": "Startchat",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "startchatreply",
    "command": "/Startchatreply",
    "bindCommand": "Startchatreply",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "startchatsemicolon",
    "command": "/Startchatsemicolon",
    "bindCommand": "Startchatsemicolon",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "startchatslash",
    "command": "/Startchatslash",
    "bindCommand": "Startchatslash",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "startchatwith",
    "command": "/Startchatwith",
    "bindCommand": "Startchatwith",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "suspendforcedmouselook",
    "command": "/suspendForcedMouselook",
    "bindCommand": "suspendForcedMouselook",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "suspendforcedmouselookandstopmoving",
    "command": "/suspendForcedMouselookAndStopMoving",
    "bindCommand": "suspendForcedMouselookAndStopMoving",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "svchanneljoin",
    "command": "/svChannelJoin",
    "bindCommand": "svChannelJoin",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "svchannelleave",
    "command": "/svChannelLeave",
    "bindCommand": "svChannelLeave",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "svmicsetlevel",
    "command": "/svMicSetLevel",
    "bindCommand": "svMicSetLevel",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "svpushtotalk",
    "command": "/svPushToTalk",
    "bindCommand": "svPushToTalk",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "svsetmute",
    "command": "/svSetMute",
    "bindCommand": "svSetMute",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "svspeakerssetlevel",
    "command": "/svSpeakersSetLevel",
    "bindCommand": "svSpeakersSetLevel",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "t",
    "command": "/t",
    "bindCommand": "t",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "tactical",
    "command": "/tactical",
    "bindCommand": "tactical",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "tacticalspecial",
    "command": "/tacticalSpecial",
    "bindCommand": "tacticalSpecial",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "target",
    "command": "/Target",
    "bindCommand": "Target",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "team",
    "command": "/team",
    "bindCommand": "team",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "team_defaultmode",
    "command": "/Team_DefaultMode",
    "bindCommand": "Team_DefaultMode",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "team_setdefaultlootmode",
    "command": "/Team_SetDefaultLootMode",
    "bindCommand": "Team_SetDefaultLootMode",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "team_setdefaultlootmodequality",
    "command": "/Team_SetDefaultLootModeQuality",
    "bindCommand": "Team_SetDefaultLootModeQuality",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "team_setspokesman",
    "command": "/Team_SetSpokesman",
    "bindCommand": "Team_SetSpokesman",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "team_setstatusmessage",
    "command": "/Team_SetStatusMessage",
    "bindCommand": "Team_SetStatusMessage",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "team_sidekicking",
    "command": "/Team_Sidekicking",
    "bindCommand": "Team_Sidekicking",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "teamhidemaptransferchoice",
    "command": "/teamHideMapTransferChoice",
    "bindCommand": "teamHideMapTransferChoice",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "tell",
    "command": "/tell",
    "bindCommand": "tell",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "terms",
    "command": "/Terms",
    "bindCommand": "Terms",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "terraindetail",
    "command": "/TerrainDetail",
    "bindCommand": "TerrainDetail",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "tex_memory_allowed",
    "command": "/tex_memory_allowed",
    "bindCommand": "tex_memory_allowed",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "tex_memory_unload_threshold",
    "command": "/tex_memory_unload_threshold",
    "bindCommand": "tex_memory_unload_threshold",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "texaniso",
    "command": "/texAniso",
    "bindCommand": "texAniso",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "texloadnearcamfocus",
    "command": "/texLoadNearCamFocus",
    "bindCommand": "texLoadNearCamFocus",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "throttleadjust",
    "command": "/ThrottleAdjust",
    "bindCommand": "ThrottleAdjust",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "throttleset",
    "command": "/ThrottleSet",
    "bindCommand": "ThrottleSet",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "throttletoggle",
    "command": "/ThrottleToggle",
    "bindCommand": "ThrottleToggle",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "timerrecordend",
    "command": "/timerRecordEnd",
    "bindCommand": "timerRecordEnd",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "timerrecordstart",
    "command": "/timerRecordStart",
    "bindCommand": "timerRecordStart",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "togglefullscreen",
    "command": "/togglefullscreen",
    "bindCommand": "togglefullscreen",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "togglegoldenpath",
    "command": "/ToggleGoldenPath",
    "bindCommand": "ToggleGoldenPath",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "tracequeries",
    "command": "/traceQueries",
    "bindCommand": "traceQueries",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "trade",
    "command": "/trade",
    "bindCommand": "trade",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "traychangeindex",
    "command": "/TrayChangeIndex",
    "bindCommand": "TrayChangeIndex",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "trayexec",
    "command": "/TrayExec",
    "bindCommand": "TrayExec",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "trayexecbytray",
    "command": "/TrayExecByTray",
    "bindCommand": "TrayExecByTray",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "trayexecbytraynotifyaudio",
    "command": "/TrayExecByTrayNotifyAudio",
    "bindCommand": "TrayExecByTrayNotifyAudio",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "trayexecbytraywithbackup",
    "command": "/TrayExecByTrayWithBackup",
    "bindCommand": "TrayExecByTrayWithBackup",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "turnleft",
    "command": "/turnleft",
    "bindCommand": "turnleft",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "turnleft1",
    "command": "/turnleft1",
    "bindCommand": "turnleft1",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "turnright",
    "command": "/turnright",
    "bindCommand": "turnright",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "turnright1",
    "command": "/turnright1",
    "bindCommand": "turnright1",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "twitter_watch",
    "command": "/twitter_watch",
    "bindCommand": "twitter_watch",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "txaa",
    "command": "/txaa",
    "bindCommand": "txaa",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "ugc_maybeshowreviewgen",
    "command": "/ugc_MaybeShowReviewGen",
    "bindCommand": "ugc_MaybeShowReviewGen",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "ugc-do",
    "command": "/UGC.Do",
    "bindCommand": "UGC.Do",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "ugceditorexportprojectsafe",
    "command": "/ugcEditorExportProjectSafe",
    "bindCommand": "ugcEditorExportProjectSafe",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "ugceditorimportprojectsafe",
    "command": "/ugcEditorImportProjectSafe",
    "bindCommand": "ugcEditorImportProjectSafe",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "ugceditormode",
    "command": "/ugcEditorMode",
    "bindCommand": "ugcEditorMode",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "ugchidereviewgen",
    "command": "/Ugchidereviewgen",
    "bindCommand": "Ugchidereviewgen",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "ugcplayingeditor_toggle",
    "command": "/Ugcplayingeditor_Toggle",
    "bindCommand": "Ugcplayingeditor_Toggle",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "ugcshowreviewgen",
    "command": "/Ugcshowreviewgen",
    "bindCommand": "Ugcshowreviewgen",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "ui_genlayersreset",
    "command": "/ui_GenLayersReset",
    "bindCommand": "ui_GenLayersReset",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "ui_load",
    "command": "/ui_load",
    "bindCommand": "ui_load",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "ui_load_file",
    "command": "/ui_load_file",
    "bindCommand": "ui_load_file",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "ui_resolution",
    "command": "/ui_resolution",
    "bindCommand": "ui_resolution",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "ui_save",
    "command": "/ui_save",
    "bindCommand": "ui_save",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "ui_save_file",
    "command": "/ui_save_file",
    "bindCommand": "ui_save_file",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "ui_tooltipdelay",
    "command": "/ui_TooltipDelay",
    "bindCommand": "ui_TooltipDelay",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "uicancel",
    "command": "/uiCancel",
    "bindCommand": "uiCancel",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "uiforgetpositions",
    "command": "/UIForgetPositions",
    "bindCommand": "UIForgetPositions",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "uiok",
    "command": "/uiOK",
    "bindCommand": "uiOK",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "uirememberpositions",
    "command": "/UIRememberPositions",
    "bindCommand": "UIRememberPositions",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "unanon",
    "command": "/unanon",
    "bindCommand": "unanon",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "unbind",
    "command": "/unbind",
    "bindCommand": "unbind",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "unbind_all",
    "command": "/unbind_all",
    "bindCommand": "unbind_all",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "unbind_local",
    "command": "/unbind_local",
    "bindCommand": "unbind_local",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "unfriend",
    "command": "/Unfriend",
    "bindCommand": "Unfriend",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "unifiedinteractatcursor",
    "command": "/unifiedInteractAtCursor",
    "bindCommand": "unifiedInteractAtCursor",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "unignore",
    "command": "/unignore",
    "bindCommand": "unignore",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "unlit",
    "command": "/unlit",
    "bindCommand": "unlit",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "unmute",
    "command": "/unmute",
    "bindCommand": "unmute",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "unpause",
    "command": "/unpause",
    "bindCommand": "unpause",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "unstuck",
    "command": "/unstuck",
    "bindCommand": "unstuck",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "up",
    "command": "/up",
    "bindCommand": "up",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "up1",
    "command": "/up1",
    "bindCommand": "up1",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "usedevice",
    "command": "/UseDevice",
    "bindCommand": "UseDevice",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "usefullskinning",
    "command": "/useFullSkinning",
    "bindCommand": "useFullSkinning",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "usemanualdisplaymodechange",
    "command": "/useManualDisplayModeChange",
    "bindCommand": "useManualDisplayModeChange",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "usesm20",
    "command": "/useSM20",
    "bindCommand": "useSM20",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "usesm2b",
    "command": "/useSM2B",
    "bindCommand": "useSM2B",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "usesm30",
    "command": "/useSM30",
    "bindCommand": "useSM30",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "version",
    "command": "/version",
    "bindCommand": "version",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "versionslow",
    "command": "/VersionSlow",
    "bindCommand": "VersionSlow",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "videomemorymax",
    "command": "/videoMemoryMax",
    "bindCommand": "videoMemoryMax",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "visscale",
    "command": "/visscale",
    "bindCommand": "visscale",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "vsync",
    "command": "/vsync",
    "bindCommand": "vsync",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "w",
    "command": "/W",
    "bindCommand": "W",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "walk1",
    "command": "/walk1",
    "bindCommand": "walk1",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "water",
    "command": "/water",
    "bindCommand": "water",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "wave",
    "command": "/Wave",
    "bindCommand": "Wave",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "whisper",
    "command": "/Whisper",
    "bindCommand": "Whisper",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "whitelist_chat",
    "command": "/Whitelist_Chat",
    "bindCommand": "Whitelist_Chat",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "whitelist_duels",
    "command": "/Whitelist_Duels",
    "bindCommand": "Whitelist_Duels",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "whitelist_emails",
    "command": "/Whitelist_Emails",
    "bindCommand": "Whitelist_Emails",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "whitelist_invites",
    "command": "/Whitelist_Invites",
    "bindCommand": "Whitelist_Invites",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "whitelist_pvpinvites",
    "command": "/Whitelist_PvPInvites",
    "bindCommand": "Whitelist_PvPInvites",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "whitelist_tells",
    "command": "/Whitelist_Tells",
    "bindCommand": "Whitelist_Tells",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "whitelist_trades",
    "command": "/Whitelist_Trades",
    "bindCommand": "Whitelist_Trades",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "who",
    "command": "/who",
    "bindCommand": "who",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "window_minimize",
    "command": "/window_minimize",
    "bindCommand": "window_minimize",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "window_restore",
    "command": "/window_restore",
    "bindCommand": "window_restore",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "worlddetail",
    "command": "/WorldDetail",
    "bindCommand": "WorldDetail",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "worldtexlodlevel",
    "command": "/worldTexLODLevel",
    "bindCommand": "worldTexLODLevel",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "wtb",
    "command": "/Wtb",
    "bindCommand": "Wtb",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "wts",
    "command": "/Wts",
    "bindCommand": "Wts",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "wtt",
    "command": "/Wtt",
    "bindCommand": "Wtt",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "yell",
    "command": "/Yell",
    "bindCommand": "Yell",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "z",
    "command": "/Z",
    "bindCommand": "Z",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "zmarket",
    "command": "/Zmarket",
    "bindCommand": "Zmarket",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  },
  {
    "id": "zone",
    "command": "/zone",
    "bindCommand": "zone",
    "aliases": [],
    "params": "",
    "category": "All Neverwinter Online"
  }
] satisfies ConsoleCommand[];

