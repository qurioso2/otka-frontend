import LegalContainer from "../ui/LegalContainer";
import LegalHtml from "../ui/LegalHtml";

export const dynamic = 'force-static';

export default async function Termeni() {
  return (
    <LegalContainer title="TERMENI ȘI CONDIȚII DE VÂNZARE">
      {/* @ts-expect-error Server Component */}
      <LegalHtml relPath="legal/terms/v1.html" />
    </LegalContainer>
  );
}
