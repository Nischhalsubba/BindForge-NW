"use client";

import { useBindForge } from "./BindForgeProvider";
import type { AccessibilityPreferences as Preferences } from "./BindForgeProvider";
import styles from "./AccessibilityPreferences.module.css";

type ChoiceOption<T extends string> = {
  value: T;
  label: string;
  description: string;
};

function ChoiceGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: ChoiceOption<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className={styles.choiceGroup}>
      <legend>{label}</legend>
      <div className={styles.choiceGrid}>
        {options.map((option) => (
          <button
            aria-pressed={value === option.value}
            className={styles.choice}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            <strong>{option.label}</strong>
            <span>{option.description}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function AccessibilityPreferences() {
  const { state, updatePreferences } = useBindForge();
  const preferences = state.preferences;

  const experienceOptions: ChoiceOption<Preferences["experience"]>[] = [
    { value: "simple", label: "Simple", description: "Guided workflows and plain-language help." },
    { value: "standard", label: "Standard", description: "Everyday tools with familiar controls." },
    { value: "advanced", label: "Advanced", description: "Technical details and power-user tools." },
  ];
  const textOptions: ChoiceOption<Preferences["textSize"]>[] = [
    { value: "small", label: "Small", description: "More compact text on larger screens." },
    { value: "default", label: "Default", description: "Balanced reading size." },
    { value: "large", label: "Large", description: "Larger text throughout the interface." },
    { value: "extra-large", label: "Extra large", description: "Maximum built-in reading size." },
  ];
  const densityOptions: ChoiceOption<Preferences["density"]>[] = [
    { value: "comfortable", label: "Comfortable", description: "More spacing between controls and sections." },
    { value: "standard", label: "Standard", description: "Balanced spacing for most players." },
    { value: "compact", label: "Compact", description: "Denser layout without shrinking touch targets." },
  ];
  const contrastOptions: ChoiceOption<Preferences["contrast"]>[] = [
    { value: "standard", label: "Standard", description: "Field-manual palette with accessible contrast." },
    { value: "high", label: "High contrast", description: "Stronger text, borders, and focus cues." },
  ];

  const booleanPreferences: Array<{
    key: "largeControls" | "reducedMotion" | "explainTerms" | "confirmRisky" | "showRawCommands";
    label: string;
    description: string;
  }> = [
    { key: "largeControls", label: "Larger controls", description: "Use roomier buttons and inputs for easier tapping." },
    { key: "reducedMotion", label: "Reduce motion", description: "Disable decorative animation while keeping feedback clear." },
    { key: "explainTerms", label: "Explain technical terms", description: "Show plain-language explanations for Neverwinter and BindForge terminology." },
    { key: "confirmRisky", label: "Confirm risky commands", description: "Ask before actions marked risky or potentially conflicting." },
    { key: "showRawCommands", label: "Show raw commands", description: "Keep the generated Neverwinter command visible by default." },
  ];

  return (
    <div className={styles.root}>
      <ChoiceGroup
        label="Experience level"
        onChange={(experience) => updatePreferences({ experience })}
        options={experienceOptions}
        value={preferences.experience}
      />
      <ChoiceGroup
        label="Text size"
        onChange={(textSize) => updatePreferences({ textSize })}
        options={textOptions}
        value={preferences.textSize}
      />
      <ChoiceGroup
        label="Interface density"
        onChange={(density) => updatePreferences({ density })}
        options={densityOptions}
        value={preferences.density}
      />
      <ChoiceGroup
        label="Contrast"
        onChange={(contrast) => updatePreferences({ contrast })}
        options={contrastOptions}
        value={preferences.contrast}
      />
      <fieldset className={styles.toggles}>
        <legend>Assistance</legend>
        {booleanPreferences.map((item) => (
          <label className={styles.toggle} key={item.key}>
            <input
              checked={preferences[item.key]}
              onChange={(event) => updatePreferences({ [item.key]: event.target.checked })}
              type="checkbox"
            />
            <span><strong>{item.label}</strong><small>{item.description}</small></span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}
