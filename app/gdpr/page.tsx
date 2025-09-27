import LegalContainer from "../ui/LegalContainer";
import LegalHtml from "../ui/LegalHtml";

export default async function GDPR() {
  return (
    <LegalContainer title="POLITICA DE CONFIDENȚIALITATE (GDPR/RGPD)">
      <LegalHtml relPath="legal/gdpr/v1.html" />
    </LegalContainer>
  );
}
