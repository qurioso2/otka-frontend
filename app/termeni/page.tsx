import LegalContainer from "../ui/LegalContainer";
import LegalHtml from "../ui/LegalHtml";

export default async function Termeni() {
  return (
    <LegalContainer title="TERMENI ȘI CONDIȚII DE VÂNZARE">
      <LegalHtml relPath="legal/terms/v1.html" />
    </LegalContainer>
  );
}
