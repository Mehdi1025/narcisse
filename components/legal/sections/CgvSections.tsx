import Link from "next/link";
import { BOUTIQUE_UNIVERS, LEGAL, legalLinks } from "@/content/legal";
import { GARANTIE_ENCARTE_BIENS, RETRACTATION_FORMULAIRE_MODELE } from "@/content/legalOfficial";
import { legalField, legalSiteUrl, tvaPriceMention, vendeurAttentionLine } from "@/lib/legal/display";
import { LegalNoticeBox } from "../LegalPage";
import type { LegalSectionBlock } from "../LegalPage";

export function buildCgvSections(giftCard: boolean): LegalSectionBlock[] {
  const e = LEGAL.exploitant;
  const l = LEGAL.lieu;
  const m = LEGAL.mediateur;

  const retractionForm = RETRACTATION_FORMULAIRE_MODELE.replace(
    "[le professionnel insère ici son nom, son adresse géographique et son adresse électronique]",
    vendeurAttentionLine(),
  );

  const sections: LegalSectionBlock[] = [
    {
      id: "objet",
      title: "1. Objet et champ d'application",
      content: (
        <>
          <p>
            Les présentes conditions générales de vente (CGV) régissent la vente en ligne de produits physiques par {LEGAL.nomCommercial}{" "}
            aux consommatrices et consommateurs, via le site {legalSiteUrl()}.
          </p>
          <p>
            Espace de bien-être féminin : santé mentale, santé physique, santé sociale — boutique et ateliers. Les CGV sont acceptées
            au moment de la commande (version du {LEGAL.version}).
          </p>
        </>
      ),
    },
    {
      id: "vendeur",
      title: "2. Identité du vendeur",
      content: (
        <>
          <ul className="list-disc space-y-1 pl-5">
            <li>Raison sociale : {legalField(e.raisonSociale)}</li>
            <li>Forme : {legalField(e.formeJuridique)}</li>
            <li>Capital : {legalField(e.capital)}</li>
            <li>Siège : {legalField(e.siege)}</li>
            <li>SIREN : {legalField(e.siren)}</li>
            <li>RCS : {legalField(e.rcs)}</li>
            <li>TVA : {legalField(e.tvaIntracom)}</li>
            <li>Contact : {legalField(e.email)} · {legalField(e.telephone)}</li>
          </ul>
          <p>
            <Link href={legalLinks.mentions} className="link-line">
              Mentions légales complètes
            </Link>
          </p>
        </>
      ),
    },
    {
      id: "produits",
      title: "3. Produits",
      content: (
        <>
          <p>Produits physiques dans les univers : {BOUTIQUE_UNIVERS.join(", ")}.</p>
          <p>Caractéristiques essentielles sur chaque fiche. Visuels d&apos;illustration. Disponibilité dans la limite des stocks.</p>
        </>
      ),
    },
    {
      id: "prix",
      title: "4. Prix",
      content: (
        <>
          <p>{tvaPriceMention()}</p>
          <p>Aucun frais de retrait sur place.</p>
        </>
      ),
    },
    {
      id: "commande",
      title: "5. Commande",
      content: (
        <>
          <ol className="list-decimal space-y-2 pl-5">
            <li>Sélection des produits et panier ;</li>
            <li>Saisie des coordonnées (sans création de compte) ;</li>
            <li>Acceptation des présentes CGV ;</li>
            <li>Clic sur « Commander avec obligation de paiement » ;</li>
            <li>Paiement sur la page sécurisée Stripe Checkout.</li>
          </ol>
          <p>
            Confirmation par e-mail avec numéro de commande et lien de suivi personnel.
          </p>
        </>
      ),
    },
    {
      id: "paiement",
      title: "6. Paiement",
      content: (
        <>
          <p>Paiement par carte bancaire via Stripe Checkout (page hébergée par Stripe). Débit à la commande.</p>
          <p>
            Réservation des stocks pendant le paiement ({LEGAL.reservationStockMinutes} minutes, alignée sur les paramètres boutique).
          </p>
          <p>Aucune donnée bancaire ne transite par le site Narcisse.</p>
        </>
      ),
    },
    {
      id: "retrait",
      title: "7. Retrait sur place",
      content: (
        <>
          <p>Adresse : {legalField(l.adresseRetrait)}. Horaires : {legalField(l.horairesRetrait)}.</p>
          <p>Délai de préparation : {legalField(l.delaiPreparation)}.</p>
          <p>E-mail lorsque la commande est prête. Présentation du numéro de commande au retrait.</p>
          <p>
            Conservation {LEGAL.conservationRetraitJours} jours après cet e-mail, puis prise de contact ; annulation et remboursement
            possibles selon la réglementation.
          </p>
        </>
      ),
    },
    {
      id: "retractation",
      title: "8. Droit de rétractation",
      content: (
        <>
          <p>
            Délai de 14 jours à compter du retrait du bien (art. L.221-18 du code de la consommation), sauf exceptions ci-dessous.
          </p>
          <p>
            Modalités : déclaration dénuée d&apos;ambiguïté à {legalField(e.email)} ou courrier à {legalField(e.siege)}. Retour des
            produits sur place ou frais à la charge de la cliente, sauf disposition contraire.
          </p>
          <p>
            Remboursement sous 14 jours par le même moyen de paiement, pouvant être différé jusqu&apos;à récupération des produits.
          </p>
          <p>
            <strong>Exceptions (art. L.221-28)</strong> : biens descellés après livraison ne pouvant être renvoyés pour raisons
            d&apos;hygiène ou de protection de la santé (cosmétiques ouverts) ; biens personnalisés.
          </p>
          <h3 className="mt-6 font-serif text-[20px]">Modèle de formulaire de rétractation</h3>
          <pre className="mt-3 whitespace-pre-wrap rounded-2xl border border-encre/15 bg-papier p-4 font-sans text-[13px] leading-relaxed">
            {retractionForm}
          </pre>
        </>
      ),
    },
    {
      id: "garanties",
      title: "9. Garanties légales",
      content: (
        <LegalNoticeBox>
          <p className="whitespace-pre-wrap">{GARANTIE_ENCARTE_BIENS}</p>
        </LegalNoticeBox>
      ),
    },
  ];

  if (giftCard) {
    sections.push({
      id: "cartes-cadeaux",
      title: "10. Cartes cadeaux",
      content: (
        <p>
          Validité {LEGAL.cartesCadeauxValiditeMois} mois à compter de l&apos;achat ; utilisables en boutique et pour les prestations ;
          ni échangeables ni remboursables, sauf disposition légale impérative.
        </p>
      ),
    });
  }

  const n = giftCard ? 11 : 10;
  sections.push(
    {
      id: "reclamations",
      title: `${n}. Réclamations et service client`,
      content: (
        <p>
          {legalField(e.email)} · {legalField(e.telephone)}
        </p>
      ),
    },
    {
      id: "mediation",
      title: `${n + 1}. Médiation`,
      content: (
        <>
          <p>
            En cas de litige non résolu avec le service client, recours gratuit au médiateur : {legalField(m.nom)},{" "}
            {legalField(m.adresse)}, {legalField(m.site)}.
          </p>
          <p className="text-[14px] text-encre/65">
            La plateforme européenne de règlement en ligne des litiges (RLL) a fermé le 20 juillet 2025 — elle n&apos;est plus accessible.
          </p>
        </>
      ),
    },
    {
      id: "donnees",
      title: `${n + 2}. Données personnelles`,
      content: (
        <p>
          <Link href={legalLinks.privacy} className="link-line text-bordeaux">
            Politique de confidentialité
          </Link>
        </p>
      ),
    },
    {
      id: "droit",
      title: `${n + 3}. Droit applicable`,
      content: (
        <p>
          Droit français. La consommatrice ou le consommateur peut saisir la juridiction de son domicile.
        </p>
      ),
    },
  );

  // Livraison / produits numériques — non proposés au lancement (sections réservées).
  // sections.push({ id: "livraison", title: "Livraison", content: ... });
  // sections.push({ id: "numerique", title: "Contenus numériques", content: ... });

  return sections;
}