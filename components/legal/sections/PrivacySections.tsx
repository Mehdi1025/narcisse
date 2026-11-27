import Link from "next/link";
import { LEGAL, legalLinks } from "@/content/legal";
import { legalField, legalSiteUrl } from "@/lib/legal/display";
import type { LegalSectionBlock } from "../LegalPage";

export function buildPrivacySections(): LegalSectionBlock[] {
  const e = LEGAL.exploitant;
  const region = legalField(LEGAL.prestataires.supabaseRegion);

  const table = (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
        <thead>
          <tr className="border-b border-encre/15">
            <th className="py-2 pr-3 font-medium">Traitement</th>
            <th className="py-2 pr-3 font-medium">Données</th>
            <th className="py-2 pr-3 font-medium">Finalité</th>
            <th className="py-2 pr-3 font-medium">Base légale</th>
            <th className="py-2 font-medium">Durée (proposée)</th>
          </tr>
        </thead>
        <tbody className="align-top text-encre/75">
          <tr className="border-b border-encre/10">
            <td className="py-3 pr-3">Commandes boutique</td>
            <td className="py-3 pr-3">Nom, e-mail, téléphone, produits, montants, n° commande</td>
            <td className="py-3 pr-3">Exécution commande, retrait, SAV</td>
            <td className="py-3 pr-3">Contrat</td>
            <td className="py-3">5 ans après commande, puis suppression</td>
          </tr>
          <tr className="border-b border-encre/10">
            <td className="py-3 pr-3">Facturation</td>
            <td className="py-3 pr-3">Données de facture</td>
            <td className="py-3 pr-3">Obligations comptables</td>
            <td className="py-3 pr-3">Obligation légale</td>
            <td className="py-3">10 ans</td>
          </tr>
          <tr className="border-b border-encre/10">
            <td className="py-3 pr-3">Paiement</td>
            <td className="py-3 pr-3">Traitées par Stripe ; pas de donnée de carte chez Narcisse</td>
            <td className="py-3 pr-3">Paiement, lutte contre la fraude</td>
            <td className="py-3 pr-3">Contrat</td>
            <td className="py-3">Selon Stripe</td>
          </tr>
          <tr className="border-b border-encre/10">
            <td className="py-3 pr-3">Ateliers</td>
            <td className="py-3 pr-3">Nom, e-mail, téléphone facultatif</td>
            <td className="py-3 pr-3">Inscriptions et liste d&apos;attente</td>
            <td className="py-3 pr-3">Contrat / mesures précontractuelles</td>
            <td className="py-3">1 an après l&apos;atelier</td>
          </tr>
          <tr className="border-b border-encre/10">
            <td className="py-3 pr-3">Comptes équipe</td>
            <td className="py-3 pr-3">Identifiant, e-mail, rôle</td>
            <td className="py-3 pr-3">Accès espaces de gestion</td>
            <td className="py-3 pr-3">Intérêt légitime</td>
            <td className="py-3">Durée de la collaboration</td>
          </tr>
          <tr>
            <td className="py-3 pr-3">Journaux techniques</td>
            <td className="py-3 pr-3">Adresse IP, logs</td>
            <td className="py-3 pr-3">Sécurité</td>
            <td className="py-3 pr-3">Intérêt légitime</td>
            <td className="py-3">1 an maximum</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return [
    {
      id: "responsable",
      title: "1. Responsable du traitement",
      content: (
        <p>
          {legalField(e.raisonSociale)} ({LEGAL.nomCommercial}), {legalField(e.siege)}. Contact données : {legalField(e.email)}.
        </p>
      ),
    },
    {
      id: "finalites",
      title: "2. Données collectées",
      content: (
        <>
          {table}
          <p className="text-[14px] text-encre/70">
            <strong>Aucune donnée de santé</strong> n&apos;est collectée par la boutique ni par les inscriptions aux ateliers. Merci de
            ne pas communiquer d&apos;informations médicales dans les champs libres.
          </p>
        </>
      ),
    },
    {
      id: "destinataires",
      title: "3. Destinataires et sous-traitants",
      content: (
        <>
          <ul className="list-disc space-y-2 pl-5">
            <li>Vercel Inc. — hébergement du site ({LEGAL.hebergeur.adresse}).</li>
            <li>Supabase — base de données et authentification équipe (région : {region}).</li>
            <li>Stripe Payments Europe, Limited (Irlande) — paiement par carte.</li>
            <li>Resend — e-mails transactionnels, si activé.</li>
          </ul>
          <p>
            Certains prestataires peuvent traiter des données hors Union européenne. Leurs transferts sont encadrés par des clauses
            contractuelles types et/ou le Data Privacy Framework (à vérifier pour chaque prestataire avant publication).
          </p>
        </>
      ),
    },
    {
      id: "cookies",
      title: "4. Cookies et stockage local",
      content: (
        <ul className="list-disc space-y-2 pl-5">
          <li>Cookies de session Supabase uniquement pour les comptes de l&apos;équipe connectée.</li>
          <li>Stockage local du navigateur pour le panier boutique et préférences d&apos;affichage.</li>
          <li>Aucun traceur publicitaire ni outil de mesure d&apos;audience : pas de bandeau cookies tant que c&apos;est le cas.</li>
          <li>Le paiement a lieu sur la page Stripe Checkout, soumise à la politique de confidentialité de Stripe.</li>
        </ul>
      ),
    },
    {
      id: "droits",
      title: "5. Vos droits",
      content: (
        <>
          <p>
            Vous disposez des droits d&apos;accès, de rectification, d&apos;effacement, de limitation, d&apos;opposition et de portabilité
            (lorsqu&apos;applicable) en écrivant à {legalField(e.email)}.
          </p>
          <p>
            Réclamation : <a href="https://www.cnil.fr" className="link-line text-bordeaux" rel="noopener noreferrer">cnil.fr</a>.
          </p>
        </>
      ),
    },
    {
      id: "securite",
      title: "6. Sécurité",
      content: <p>Accès restreint, échanges chiffrés (HTTPS), paiement délégué à Stripe.</p>,
    },
    {
      id: "maj",
      title: "7. Mise à jour",
      content: (
        <p>
          Politique en vigueur au {LEGAL.version}. Boutique :{" "}
          <Link href={`${legalSiteUrl()}/boutique`} className="link-line">
            {legalSiteUrl()}/boutique
          </Link>
          . Voir aussi les{" "}
          <Link href={legalLinks.cgv} className="link-line text-bordeaux">
            CGV
          </Link>
          .
        </p>
      ),
    },
  ];
}