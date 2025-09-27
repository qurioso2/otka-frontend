import LegalContainer from "../ui/LegalContainer";
import LegalHtml from "../ui/LegalHtml";

export const dynamic = 'force-static';

export default async function Cookies() {
  return (
    <LegalContainer title="POLITICA DE COOKIES">
      {/* public/legal/cookies/v1.html */}
      {/* @ts-expect-error Server Component */}
      <LegalHtml relPath="legal/cookies/v1.html" />
    </LegalContainer>
  );
}
