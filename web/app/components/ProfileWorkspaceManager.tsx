"use client";

import { useState } from "react";
import styles from "./WorkspaceControls.module.css";

type ProfileSummary = { id: string; name: string };
type CharacterSummary = {
  id: string;
  name: string;
  className: string;
  paragon: string;
  role: string;
  profiles: ProfileSummary[];
};

type ProfileWorkspaceManagerProps = {
  characters: CharacterSummary[];
  activeCharacterId: string;
  activeProfileId: string;
  activeCharacter: CharacterSummary;
  activeProfile: ProfileSummary;
  canDeleteCharacter: boolean;
  canDeleteProfile: boolean;
  status: string;
  onActiveCharacterChange: (id: string) => void;
  onActiveProfileChange: (id: string) => void;
  onAddCharacter: () => void;
  onAddProfile: () => void;
  onCharacterNameChange: (value: string) => void;
  onCharacterClassChange: (value: string) => void;
  onCharacterParagonChange: (value: string) => void;
  onCharacterRoleChange: (value: string) => void;
  onProfileNameChange: (value: string) => void;
  onDeleteCharacter: () => void;
  onDeleteProfile: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
};

const classes = ["Unassigned", "Barbarian", "Bard", "Cleric", "Fighter", "Paladin", "Ranger", "Rogue", "Warlock", "Wizard"];
const roles = ["DPS", "Tank", "Heal", "Hybrid"];

export function ProfileWorkspaceManager(props: ProfileWorkspaceManagerProps) {
  const [manageOpen, setManageOpen] = useState(false);

  return (
    <section className={styles.profileWorkspace} aria-labelledby="profile-workspace-title">
      <div className={styles.profileWorkspaceHeading}>
        <div>
          <span>My Setup</span>
          <strong id="profile-workspace-title">Character &amp; keymap profiles</strong>
        </div>
        <p>Keep character-specific keys and conflict imports separate. Everything stays in this browser.</p>
      </div>

      <div className={styles.profileSelectors}>
        <label>
          Character
          <select aria-label="Active character" onChange={(event) => props.onActiveCharacterChange(event.target.value)} value={props.activeCharacterId}>
            {props.characters.map((character) => <option key={character.id} value={character.id}>{character.name}</option>)}
          </select>
        </label>
        <button onClick={() => { props.onAddCharacter(); setManageOpen(true); }} type="button">Add character</button>
        <label>
          Profile
          <select aria-label="Active profile" onChange={(event) => props.onActiveProfileChange(event.target.value)} value={props.activeProfileId}>
            {props.activeCharacter.profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
          </select>
        </label>
        <button onClick={() => { props.onAddProfile(); setManageOpen(true); }} type="button">Add profile</button>
      </div>

      <button aria-expanded={manageOpen} className={styles.manageToggle} onClick={() => setManageOpen((value) => !value)} type="button">
        <span>Manage character &amp; profile</span>
        <span aria-hidden="true">{manageOpen ? "−" : "+"}</span>
      </button>

      {manageOpen ? (
        <div className={styles.profileManage}>
          <div className={styles.profileFields}>
            <label>Character name<input aria-label="Character name" maxLength={48} onChange={(event) => props.onCharacterNameChange(event.target.value)} value={props.activeCharacter.name} /></label>
            <label>Character class<select aria-label="Character class" onChange={(event) => props.onCharacterClassChange(event.target.value)} value={props.activeCharacter.className}>{classes.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
            <label>Character role<select aria-label="Character role" onChange={(event) => props.onCharacterRoleChange(event.target.value)} value={props.activeCharacter.role}>{roles.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
            <label>Character paragon<input aria-label="Character paragon" maxLength={64} onChange={(event) => props.onCharacterParagonChange(event.target.value)} placeholder="Optional" value={props.activeCharacter.paragon} /></label>
            <label>Profile name<input aria-label="Profile name" maxLength={48} onChange={(event) => props.onProfileNameChange(event.target.value)} value={props.activeProfile.name} /></label>
          </div>
          <div className={styles.profileActions}>
            <button disabled={!props.canDeleteCharacter} onClick={props.onDeleteCharacter} type="button">Delete character</button>
            <button disabled={!props.canDeleteProfile} onClick={props.onDeleteProfile} type="button">Delete profile</button>
            <button onClick={props.onExport} type="button">Export My Setup</button>
            <label className={styles.fileButton}>Import My Setup<input accept="application/json,.json" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) props.onImport(file); event.currentTarget.value = ""; }} type="file" /></label>
          </div>
          <p aria-live="polite" className={styles.profileStatus} role="status">{props.status || `${props.activeCharacter.name} · ${props.activeProfile.name}`}</p>
        </div>
      ) : null}
    </section>
  );
}
