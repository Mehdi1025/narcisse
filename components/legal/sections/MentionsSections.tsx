import Link from "next/link";
import { BOUTIQUE_UNIVERS, LEGAL, legalLinks } from "@/content/legal";
import { legalField, legalSiteUrl } from "@/lib/legal/display";
import type { LegalSectionBlock } from "../LegalPage";

export function buildMentionsSections(): LegalSectionBlock[] {
  const e = LEGAL.exploitant;
  const h = LEGAL.hebergeur;

  return [
    {
      id: "editeur",
      title: "Éditeur du site",
      content: (
        <>
          <p>
            Nom commercial : {LEGAL.nomCommercial}. Site : {legalSiteUrl()}.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Raison sociale : {legalField(e.raisonSociale)}</li>
            <li>Forme juridique : {legalField(e.formeJuridique)}</li>
            <li>Capital social : {legalField(e.capital)}</li>
            <li>Siège social : {legalField(e.siege)}</li>
            <li>SIREN : {legalField(e.siren)}</li>
            <li>RCS / répertoire : {legalField(e.rcs)}</li>
            <li>N° TVA intracommunautaire : {legalField(e.tvaIntracom)}</li>
            <li>Téléphone : {legalField(e.telephone)}</li>
            <li>E-mail : {legalField(e.email)}</li>
            <li>Directeur de la publication : {legalField(e.directeurPublication)}</li>
          </ul>
        </>
      ),
    },
    {
      id: "hebergeur",
      title: "Hébergeur",
      content: (
        <p>
          {h.nom}, {h.adresse} — {h.site} (coordonnées à vérifier sur le site officiel du prestataire).
        </p>
      ),
    },
    {
      id: "realisation",
      title: "Conception et réalisation",
      content: <p>{legalField(LEGAL.realisation)}</p>,
    },
    {
      id: "pi",
      title: "Propriété intellectuelle",
      content: (
        <>
          <p>
            Marque, logo, textes et visuels de {LEGAL.nomCommercial} sont protégés. Toute reproduction ou représentation non
            autorisée est interdite.
          </p>
          <p>Les visuels de la boutique en ligne sont des illustrations ; les photographies produit définitives peuvent différer.</p>
          <p>Boutique : univers {BOUTIQUE_UNIVERS.join(", ")}.</p>
        </>
      ),
    },
    {
      id: "donnees",
      title: "Données personnelles",
      content: (
        <p>
          Voir la{" "}
          <Link href={legalLinks.privacy} className="link-line text-bordeaux">
            politique de confidentialité
          </Link>
          .
        </p>
      ),
    },
    {
      id: "liens",
      title: "Documents contractuels",
      content: (
        <p>
          <Link href={legalLinks.cgv} className="link-line text-bordeaux">
            Conditions générales de vente
          </Link>{" "}
          ·{" "}
          <Link href={legalLinks.privacy} className="link-line">
            Politique de confidentialité
          </Link>
        </p>
      ),
    },
  ];
}