import { Languages } from "lucide-react";
import { useLang } from "../i18n";

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useLang();
  return (
    <label className="flex items-center gap-2 text-sm" aria-label={t("language")}>
      <Languages size={16} />
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900"
      >
        <option value="en">English</option>
<option value="hi">हिन्दी</option>
<option value="ta">தமிழ்</option>
<option value="kn">ಕನ್ನಡ</option>
      </select>
    </label>
  );
}