import LegalContainer from "../ui/LegalContainer";
import LegalHtml from "../ui/LegalHtml";

export const dynamic = 'force-static';

export default async function GDPR() {
  return (
    <LegalContainer title="POLITICA DE CONFIDENȚIALITATE (GDPR/RGPD)">
      {/* @ts-expect-error Server Component */}
      <LegalHtml relPath="legal/gdpr/v1.html" />
    </LegalContainer>
  );
}
