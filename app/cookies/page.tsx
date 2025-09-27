import LegalContainer from "../ui/LegalContainer";
import LegalHtml from "../ui/LegalHtml";

export default async function Cookies() {
  return (
    <LegalContainer title="POLITICA DE COOKIES">
      <LegalHtml relPath="legal/cookies/v1.html" />
    </LegalContainer>
  );
}
