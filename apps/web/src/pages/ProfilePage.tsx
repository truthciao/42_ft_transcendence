import { type FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { type ProfilePayload } from "../api/profile";
import {
 useProfile,
 useUpdateProfile
} from "../hooks/useProfile";

export function ProfilePage() {
  const { t, i18n } = useTranslation();

  const {
  data: profile,
  isLoading,
  isError,
  }=useProfile();

  const [form, setForm] = useState<ProfilePayload>({
    displayName: "",
    bio: "",
    avatarUrl: "",
    preferredLanguage: "",
  });

  useEffect(() => {
    if (!profile) return;

    setForm({
      displayName: profile.displayName ?? "",
      bio: profile.bio ?? "",
      avatarUrl: profile.avatarUrl ?? "",
      preferredLanguage:
        profile.preferredLanguage ?? i18n.language,
    });

    if (
      profile.preferredLanguage &&
      profile.preferredLanguage !== i18n.language
    ) {
      void i18n.changeLanguage(profile.preferredLanguage);
    }
  }, [profile, i18n]);

  const mutation = useUpdateProfile();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate(form);
  }

  if (isLoading) {
    return (
      <main
        style={{
          maxWidth: 560,
          margin: "2rem auto",
          fontFamily: "sans-serif",
        }}
      >
        <p>{t("common.loading")}</p>
      </main>
    );
  }

  if (isError || !profile) {
    return (
      <main
        style={{
          maxWidth: 560,
          margin: "2rem auto",
          fontFamily: "sans-serif",
        }}
      >
        <p style={{ color: "red" }}>
          {t("profile.status.loadError")}
        </p>
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: 560,
        margin: "2rem auto",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "1.75rem",
            }}
          >
            {t("profile.title")}
          </h1>

          <p
            style={{
              margin: "0.25rem 0 0 0",
              color: "#6b7280",
              fontSize: "0.9rem",
            }}
          >
            {t("profile.description")}
          </p>
        </div>

        {profile.user && (
          <div
            style={{
              background: "#f3f4f6",
              padding: "0.5rem 0.75rem",
              borderRadius: "20px",
              border: "1px solid #e5e7eb",
              textAlign: "right",
            }}
          >
            <span
              style={{
                fontSize: "0.85rem",
                color: "#4b5563",
              }}
            >
              {t("profile.loggedInAs")}{" "}
            </span>

            <strong
              style={{
                fontSize: "0.9rem",
                color: "#1f2937",
              }}
            >
              {profile.user.username}
            </strong>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "1rem",
        }}
      >
        <label>
          <div>{t("profile.displayName")}</div>

          <input
            value={form.displayName}
            placeholder={t("profile.displayNamePlaceholder")}
            onChange={(e) =>
              setForm({
                ...form,
                displayName: e.target.value,
              })
            }
            style={{
              width: "100%",
              padding: "0.5rem",
            }}
          />
        </label>

        <label>
          <div>{t("profile.bio")}</div>

          <textarea
            rows={5}
            value={form.bio}
            placeholder={t("profile.bioPlaceholder")}
            onChange={(e) =>
              setForm({
                ...form,
                bio: e.target.value,
              })
            }
            style={{
              width: "100%",
              padding: "0.5rem",
            }}
          />
        </label>

        <label>
          <div>{t("profile.avatar")}</div>

          <input
            type="url"
            value={form.avatarUrl}
            placeholder={t("profile.avatarPlaceholder")}
            onChange={(e) =>
              setForm({
                ...form,
                avatarUrl: e.target.value,
              })
            }
            style={{
              width: "100%",
              padding: "0.5rem",
            }}
          />
        </label>

        <label>
          <div>{t("profile.preferredLanguage")}</div>

          <select
            value={form.preferredLanguage}
            onChange={(e) => {
              const language = e.target.value;

              setForm({
                ...form,
                preferredLanguage: language,
              });

              void i18n.changeLanguage(language);
            }}
            style={{
              width: "100%",
              padding: "0.5rem",
            }}
          >
            <option value="en">{t("language.english")}</option>
            <option value="fr">{t("language.french")}</option>
            <option value="zh">{t("language.chinese")}</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={mutation.isPending}
          style={{
            padding: "0.75rem 1rem",
            cursor: mutation.isPending ? "not-allowed" : "pointer",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontWeight: "bold",
            opacity: mutation.isPending ? 0.7 : 1,
          }}
        >
          {mutation.isPending
            ? t("common.saving")
            : t("common.save")}
        </button>
      </form>

      {mutation.isSuccess && (
        <p
          style={{
            marginTop: "1rem",
            fontWeight: "bold",
            color: "green",
          }}
        >
          {t("profile.status.updateSuccess")}
        </p>
      )}

      {mutation.isError && (
        <p>
          {t("profile.status.updateError")}
        </p>
      )}
    </main>
  );
}