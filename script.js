/*
 * Barangay Case Analyzer
 *
 * This script provides the logic to handle form interactions, input
 * validation, automated legal research analysis, mediation strategy
 * generation and report rendering. It also supports PDF export and
 * printing. All processing is performed client‑side using plain
 * JavaScript for ease of deployment.
 */

(() => {
  // Helper: update respondent indices and toggle remove button visibility
  function refreshRespondentIndices() {
    const respondents = document.querySelectorAll('#respondentContainer .respondent');
    respondents.forEach((div, index) => {
      const idxSpan = div.querySelector('.respondent-index');
      if (idxSpan) idxSpan.textContent = index + 1;
      const removeBtn = div.querySelector('.remove-respondent');
      if (removeBtn) {
        removeBtn.style.display = respondents.length > 1 ? 'inline-block' : 'none';
      }
    });
  }

  // Add new respondent section
  function addRespondent() {
    const container = document.getElementById('respondentContainer');
    const respondents = container.querySelectorAll('.respondent');
    const last = respondents[respondents.length - 1];
    const clone = last.cloneNode(true);
    // Clear values in clone
    clone.querySelectorAll('input, textarea').forEach((el) => {
      el.value = '';
    });
    container.appendChild(clone);
    refreshRespondentIndices();
  }

  // Remove respondent
  function removeRespondent(btn) {
    const div = btn.closest('.respondent');
    if (!div) return;
    div.remove();
    refreshRespondentIndices();
  }

  // Validate required fields
  function validateForm() {
    const summaryEl = document.getElementById('incidentSummary');
    const locationEl = document.getElementById('incidentLocation');
    const dateEl = document.getElementById('incidentDateTime');
    let valid = true;
    // Incident summary must be at least 30 characters
    if (!summaryEl.value || summaryEl.value.trim().length < 30) {
      summaryEl.classList.add('is-invalid');
      valid = false;
    } else {
      summaryEl.classList.remove('is-invalid');
    }
    // Location required
    if (!locationEl.value || locationEl.value.trim().length === 0) {
      locationEl.classList.add('is-invalid');
      valid = false;
    } else {
      locationEl.classList.remove('is-invalid');
    }
    // Date/time required
    if (!dateEl.value) {
      dateEl.classList.add('is-invalid');
      valid = false;
    } else {
      dateEl.classList.remove('is-invalid');
    }
    return valid;
  }

  // Determine case classification based on summary keywords
  function classifyCase(summary) {
    const text = summary.toLowerCase();
    // Keywords associated with theft or taking property. Include various synonyms to catch common phrasing.
    if (/steal|theft|stole|rob|robbed|take|took|taken|takin|missing/.test(text)) return 'theft';
    if (/threat|kill|hurt|intimidat/.test(text)) return 'threat';
    if (/defam|slander|insult|libel|oral/.test(text)) return 'defamation';
    if (/injur|hit|punch|physical|attack/.test(text)) return 'injury';
    return 'general';
  }

  // Predefined legal analysis data with citations
  const LEGAL_DATA = {
    theft: {
      nature: 'Theft / Qualified Theft',
      description:
        'Theft involves taking personal property belonging to another without their consent and with intent to gain. Qualified theft occurs when the offender and owner have a relationship of trust (e.g., employee and employer).',
      violations: [
        {
          title: 'Theft',
          basis: 'Revised Penal Code Art. 308',
          text:
            'Article 308 defines theft as taking personal property belonging to another without violence or intimidation, including the misappropriation of found property and the concealment of lost goods. The offender must intend to gain from the property【302115606301760†L4077-L4134】.',
          penalty:
            'Article 309 provides penalties depending on the value of the property: if the value does not exceed ₱5,000, arresto mayor or fine applies; between ₱5,000 and ₱12,000, arresto mayor to prision correccional; ₱12,000 to ₱50,000, prision correccional; above ₱50,000, prision mayor【302115606301760†L4077-L4134】.',
        },
        {
          title: 'City ordinance on employment of seniors and PWDs',
          basis: 'San Pedro City Ordinance No. 2024‑13',
          text:
            'This ordinance mandates private businesses to reserve at least one job out of ten for senior citizens and persons with disabilities (PWDs) and requires city offices to allocate at least 1% of positions to them【50922767766975†L25-L57】.',
          penalty:
            'Non‑compliance or misrepresentation results in a fine of ₱5,000 or imprisonment up to one year【50922767766975†L25-L57】.',
        },
      ],
      jurisprudence: [
        {
          title: 'Sonia Balagtas v. People (G.R. No. 257483, 30 Oct 2024)',
          summary:
            'The Supreme Court held that, to convict for qualified theft, the prosecution must prove a relationship of confidence between the accused and the offended party. In this case, a payroll manager who padded salaries and pocketed the difference was convicted of qualified theft【267612455535893†L72-L76】【267612455535893†L87-L96】.',
        },
      ],
      counters: [
        {
          title: 'Malicious mischief',
          basis: 'Revised Penal Code Art. 327',
          text:
            'If property was merely damaged without intent to gain, the proper charge may be malicious mischief rather than theft.',
          penalty: 'Penalties vary depending on the amount of damage (fine or imprisonment).',
        },
        {
          title: 'False accusation / Oral defamation',
          basis: 'Revised Penal Code Art. 358',
          text:
            'A respondent may file a counter‑charge for oral defamation if the complainant made false or malicious allegations.',
          penalty:
            'Serious oral defamation is punishable by arresto mayor to prision correccional; slight defamation carries arresto menor or a fine【302115606301760†L4784-L4793】.',
        },
      ],
    },
    threat: {
      nature: 'Grave Threats / Threatening Behaviour',
      description:
        'Threats involve threatening another with the infliction of any wrong amounting to a crime. Grave threats are punished based on conditions set and whether the threat is fulfilled.',
      violations: [
        {
          title: 'Grave threats',
          basis: 'Revised Penal Code Art. 282',
          text:
            'Article 282 punishes any person who threatens another with the infliction of a wrong amounting to a crime. The penalty varies depending on whether a demand or condition is imposed and whether the threat is communicated in writing or through a middleman【467119748815266†L161-L178】.',
          penalty:
            'If the threat includes a demand and the offender attains the objective, the penalty is one degree lower than that prescribed for the threatened crime. If the objective is not attained, two degrees lower; if there is no demand or condition, the penalty is arresto mayor and a fine up to ₱100,000【467119748815266†L161-L178】.',
        },
      ],
      jurisprudence: [
        {
          title: 'Paera v. People (G.R. No. 181626)',
          summary:
            'The Court upheld the conviction of a barangay chairman who brandished a bolo and threatened his neighbours by shouting “I will kill you,” ruling that his actions constituted grave threats【701912971857914†L75-L110】.',
        },
      ],
      counters: [
        {
          title: 'Provocation and self‑defense',
          basis: 'General defence',
          text:
            'Respondents may argue that any threatening statement was provoked or uttered in self‑defense. The presence of mitigating circumstances can reduce criminal liability.',
          penalty: 'Penalties may be lowered if mitigating circumstances are established.',
        },
        {
          title: 'False accusation / Oral defamation',
          basis: 'Revised Penal Code Art. 358',
          text:
            'The respondent may counter‑charge for libel or oral defamation if the complainant exaggerated or fabricated the alleged threats.',
          penalty:
            'Serious oral defamation is punishable by arresto mayor to prision correccional; slight defamation by arresto menor or fine【302115606301760†L4784-L4793】.',
        },
      ],
    },
    defamation: {
      nature: 'Oral Defamation (Slander)',
      description:
        'Oral defamation or slander consists in speaking ill of another, imputing a vice, defect or act which tends to cause dishonour, discredit or contempt.',
      violations: [
        {
          title: 'Oral defamation',
          basis: 'Revised Penal Code Art. 358',
          text:
            'Article 358 punishes oral defamation: serious defamation is committed when imputations are serious, while slight defamation covers minor insults. The provision prescribes the applicable penalties【302115606301760†L4784-L4793】.',
          penalty:
            'Serious oral defamation: arresto mayor to prision correccional; slight defamation: arresto menor or a fine not exceeding ₱200【302115606301760†L4784-L4793】.',
        },
      ],
      jurisprudence: [
        {
          title: 'Balite v. People (G.R. L‑21475, 30 Sept 1966)',
          summary:
            'The Supreme Court convicted a union president of grave oral defamation after he publicly accused another of misappropriating strike funds; the Court imposed arresto mayor and prision correccional【363720073413201†L79-L87】【363720073413201†L117-L124】.',
        },
      ],
      counters: [
        {
          title: 'Truth and privileged communications',
          basis: 'Revised Penal Code Arts. 354 & 361',
          text:
            'Statements made in the performance of a lawful duty or in privileged occasions (e.g., judicial proceedings) are not actionable if true and made in good faith.',
          penalty: 'No criminal liability if privilege is established.',
        },
        {
          title: 'Counter‑libel against complainant',
          basis: 'Revised Penal Code Art. 358',
          text:
            'If the complainant publicly utters false accusations or defamatory statements during the case, the respondent may file a libel or defamation case.',
          penalty:
            'Serious oral defamation: arresto mayor to prision correccional; slight defamation: arresto menor or fine【302115606301760†L4784-L4793】.',
        },
      ],
    },
    injury: {
      nature: 'Physical Injuries',
      description:
        'Physical injuries offences punish acts inflicting bodily harm. Slight physical injuries cover cases where incapacity or medical attendance does not exceed nine days.',
      violations: [
        {
          title: 'Slight physical injuries',
          basis: 'Revised Penal Code Art. 266',
          text:
            'Article 266 penalises slight physical injuries and maltreatment. When the offended party is incapacitated for labour or needs medical attendance from one to nine days, the penalty is arresto menor; if the injuries do not prevent work, a fine not exceeding ₱500 is imposed【302115606301760†L3534-L3546】.',
          penalty:
            'Arresto menor (1–30 days) or fine up to ₱500【302115606301760†L3534-L3546】.',
        },
      ],
      jurisprudence: [],
      counters: [
        {
          title: 'Self‑defense',
          basis: 'General defence',
          text:
            'Respondent may assert that any injuries were inflicted in lawful self‑defense or defense of a relative, which can justify the act.',
          penalty: 'No criminal liability if all elements of self‑defense are present.',
        },
        {
          title: 'Mutual affray',
          basis: 'Revised Penal Code Art. 251',
          text:
            'If both parties voluntarily engaged in a fight, each may be liable only for lesser offences depending on the injuries inflicted.',
          penalty:
            'Penalties vary by resulting injuries and participation.',
        },
      ],
    },
    general: {
      nature: 'General Complaint / Other Offence',
      description:
        'The facts provided do not clearly correspond to a single criminal classification. Barangay officials should evaluate all facts and identify applicable laws.',
      violations: [
        {
          title: 'Barangay justice system',
          basis: 'Local Government Code & Katarungang Pambarangay Rules',
          text:
            'Most disputes between residents of the same barangay must be referred to the Lupong Tagapamayapa for amicable settlement before they can be filed in court. Exceptions include offences punishable by more than one year’s imprisonment or a fine exceeding ₱5,000.',
          penalty: 'If mediation fails, the complaint may proceed to the courts.',
        },
        {
          title: 'Relevant local ordinances',
          basis: 'San Pedro City ordinances',
          text:
            'San Pedro City enacts ordinances on matters such as noise control, curfew, sanitation, environmental protection and employment. Depending on the complaint, specific ordinances may apply.',
          penalty: 'Penalties vary by ordinance.',
        },
      ],
      jurisprudence: [],
      counters: [],
    },
  };

  // Generate mediation/conciliation strategy based on classification
  function generateMediationStrategy(classification) {
    const now = new Date();
    const localeDate = now.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });
    const commonObjectives = [
      'Clarify all facts and ensure both parties are fully heard',
      'Encourage parties to agree on appropriate restitution or compensation',
      'Promote respect and restore harmony within the barangay community',
      'Prevent escalation to formal court proceedings when possible',
      'Ensure compliance with applicable laws and ordinances',
    ];
    const issues = [];
    const notForMediation = [];
    const outcomes = [];

    switch (classification) {
      case 'theft':
        issues.push('Return of the allegedly stolen property or restitution of its value');
        issues.push('Apology and acknowledgement of harm caused');
        issues.push('Agreement on future conduct and respect for property rights');
        notForMediation.push('Determination of criminal guilt for theft (requires court jurisdiction)');
        outcomes.push('Full restitution and documented apology');
        outcomes.push('Community service or volunteer work as a gesture of remorse');
        break;
      case 'threat':
        issues.push('Commitment by respondent to refrain from making threats or harassing statements');
        issues.push('Discussion of any underlying disputes prompting the threat');
        issues.push('Agreement on safety measures or distance requirements');
        notForMediation.push('Prosecution of grave threats if elements are present');
        outcomes.push('Written undertaking to maintain peace and respect');
        outcomes.push('Agreement on mutual non‑harassment or communications guidelines');
        break;
      case 'defamation':
        issues.push('Withdrawal or correction of defamatory statements');
        issues.push('Public or written apology to restore reputation');
        issues.push('Agreement to avoid repeating defamatory statements in the future');
        notForMediation.push('Criminal prosecution for serious defamation');
        outcomes.push('Signed retraction and apology');
        outcomes.push('Community clarification to mitigate reputational harm');
        break;
      case 'injury':
        issues.push('Compensation for medical expenses and lost wages');
        issues.push('Agreement on avoiding physical confrontation in future');
        issues.push('Exploring root causes of the altercation');
        notForMediation.push('Determination of liability for serious physical injuries');
        outcomes.push('Payment of medical costs and damages');
        outcomes.push('Mutual agreement to maintain distance and respect');
        break;
      default:
        issues.push('Clarification of the specific grievances presented');
        issues.push('Identification of applicable laws and ordinances');
        issues.push('Exploration of remedies agreeable to both parties');
        notForMediation.push('Matters involving imprisonment of more than one year or fines over ₱5,000');
        outcomes.push('Amicable settlement documented with the Lupong Tagapamayapa');
        outcomes.push('Referral to appropriate agencies if outside barangay jurisdiction');
        break;
    }

    // Limit objectives to 5 and randomise order to vary output
    const selectedObjectives = commonObjectives.slice(0, 5);

    return { objectives: selectedObjectives, issues, notForMediation, outcomes };
  }

  // Generate mediation questions based on roles and summary
  function generateQuestions(classification, role, location, dateTime) {
    // Use role to personalise pronouns
    const party = role === 'complainant' ? 'you' : 'you';
    // Format date/time
    const dt = dateTime ? new Date(dateTime).toLocaleString('en-US', { timeZone: 'Asia/Manila' }) : '';
    const loc = location || 'the location';
    const openEnded = [];
    const clarifying = [];
    const reflective = [];
    const exploratory = [];
    const conscience = [];
    openEnded.push(`Can you describe in your own words what happened at ${loc} on ${dt}?`);
    openEnded.push(`What events led up to the incident and how did you react?`);
    openEnded.push(`How has this incident affected you personally and your daily life?`);
    clarifying.push(`What time did the incident occur and who else was present?`);
    clarifying.push(`Where exactly at ${loc} did the interaction take place?`);
    clarifying.push(`Can you specify any statements or actions you find particularly significant?`);
    reflective.push(`How do you think the other party felt during the incident?`);
    reflective.push(`Looking back, is there anything you wish had been done differently?`);
    reflective.push(`How has this dispute impacted your relationship with the other party?`);
    exploratory.push(`What do you consider a fair and just resolution to this dispute?`);
    exploratory.push(`Are there any compromises you are willing to make to settle this matter?`);
    exploratory.push(`What would rebuilding trust look like for you?`);
    conscience.push(`If the roles were reversed, how would you want to be treated?`);
    conscience.push(`What message do you want to send to the community about resolving disputes?`);
    conscience.push(`How would an amicable settlement benefit both you and the other party?`);
    return { openEnded, clarifying, reflective, exploratory, conscience };
  }

  // Render the report into HTML
  function renderReport(data) {
    const reportContent = document.getElementById('reportContent');
    reportContent.innerHTML = '';
    // Header
    const now = new Date();
    const genDate = now.toLocaleString('en-US', { timeZone: 'Asia/Manila' });
    const header = document.createElement('div');
    header.classList.add('text-center', 'mb-4');
    const title = document.createElement('h2');
    title.textContent = data.caseTitle;
    const sub = document.createElement('p');
    sub.innerHTML = `<em>Generated on ${genDate}</em>`;
    header.appendChild(title);
    header.appendChild(sub);
    reportContent.appendChild(header);

    // Profile section
    const profSec = document.createElement('div');
    profSec.classList.add('mb-4');
    const profTitle = document.createElement('h3');
    profTitle.textContent = 'Case & Parties Information';
    profSec.appendChild(profTitle);
    const profList = document.createElement('ul');
    profList.classList.add('list-unstyled');
    // Case ID and date received if provided
    if (data.caseId) {
      const li = document.createElement('li');
      li.innerHTML = `<strong>Case ID:</strong> ${data.caseId}`;
      profList.appendChild(li);
    }
    if (data.dateReceived) {
      const li = document.createElement('li');
      const recDate = new Date(data.dateReceived).toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });
      li.innerHTML = `<strong>Date Received:</strong> ${recDate}`;
      profList.appendChild(li);
    }
    // Complainant details
    if (data.complainant.name || data.complainant.phone || data.complainant.email || data.complainant.address) {
      const li = document.createElement('li');
      let html = '<strong>Complainant:</strong> ';
      html += data.complainant.name ? `${data.complainant.name}` : 'N/A';
      const contact = [];
      if (data.complainant.phone) contact.push(`Phone: ${data.complainant.phone}`);
      if (data.complainant.email) contact.push(`Email: ${data.complainant.email}`);
      if (data.complainant.address) contact.push(`Address: ${data.complainant.address}`);
      if (contact.length) html += ` – ${contact.join('; ')}`;
      li.innerHTML = html;
      profList.appendChild(li);
    }
    // Respondent list
    if (data.respondents.length > 0) {
      data.respondents.forEach((resp, idx) => {
        const li = document.createElement('li');
        let html = `<strong>Respondent ${idx + 1}:</strong> `;
        html += resp.name ? `${resp.name}` : 'N/A';
        const contact = [];
        if (resp.phone) contact.push(`Phone: ${resp.phone}`);
        if (resp.email) contact.push(`Email: ${resp.email}`);
        if (resp.address) contact.push(`Address: ${resp.address}`);
        if (contact.length) html += ` – ${contact.join('; ')}`;
        li.innerHTML = html;
        profList.appendChild(li);
      });
    }
    profSec.appendChild(profList);
    reportContent.appendChild(profSec);

    // Incident details section
    const detailsSec = document.createElement('div');
    detailsSec.classList.add('mb-4');
    const detailsTitle = document.createElement('h3');
    detailsTitle.textContent = 'Incident Details';
    detailsSec.appendChild(detailsTitle);
    const dlist = document.createElement('ul');
    dlist.classList.add('list-unstyled');
    const sumli = document.createElement('li');
    sumli.innerHTML = `<strong>Summary:</strong> ${data.incident.summary}`;
    dlist.appendChild(sumli);
    const locli = document.createElement('li');
    locli.innerHTML = `<strong>Location:</strong> ${data.incident.location}`;
    dlist.appendChild(locli);
    const dateli = document.createElement('li');
    const dtFormatted = new Date(data.incident.dateTime).toLocaleString('en-US', { timeZone: 'Asia/Manila' });
    dateli.innerHTML = `<strong>Date & Time:</strong> ${dtFormatted}`;
    dlist.appendChild(dateli);
    detailsSec.appendChild(dlist);
    reportContent.appendChild(detailsSec);

    // Legal analysis section
    const legalSec = document.createElement('div');
    legalSec.classList.add('mb-4');
    const legalTitle = document.createElement('h3');
    legalTitle.textContent = 'Legal Research Analysis';
    legalSec.appendChild(legalTitle);
    // Nature of case
    const natureH4 = document.createElement('h4');
    natureH4.textContent = 'Nature of Case';
    legalSec.appendChild(natureH4);
    const natureP = document.createElement('p');
    natureP.textContent = `${data.analysis.nature}: ${data.analysis.description}`;
    legalSec.appendChild(natureP);
    // Violations
    if (data.analysis.violations && data.analysis.violations.length) {
      const violH4 = document.createElement('h4');
      violH4.textContent = 'Possible Legal Violations by Respondent(s)';
      legalSec.appendChild(violH4);
      const violList = document.createElement('ol');
      data.analysis.violations.forEach((v) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${v.title}</strong><br/><em>Legal basis:</em> ${v.basis}<br/><em>Provision:</em> ${v.text}<br/><em>Penalty:</em> ${v.penalty}`;
        violList.appendChild(li);
      });
      legalSec.appendChild(violList);
    }
    // Jurisprudence
    if (data.analysis.jurisprudence && data.analysis.jurisprudence.length) {
      const jurH4 = document.createElement('h4');
      jurH4.textContent = 'Related Court Jurisprudence';
      legalSec.appendChild(jurH4);
      const jurList = document.createElement('ol');
      data.analysis.jurisprudence.forEach((c) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${c.title}</strong>: ${c.summary}`;
        jurList.appendChild(li);
      });
      legalSec.appendChild(jurList);
    }
    // Counter charges
    if (data.analysis.counters && data.analysis.counters.length) {
      const counterH4 = document.createElement('h4');
      counterH4.textContent = 'Possible Counter‑Charges by Respondent(s)';
      legalSec.appendChild(counterH4);
      const counterList = document.createElement('ol');
      data.analysis.counters.forEach((c) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${c.title}</strong><br/><em>Legal basis:</em> ${c.basis}<br/><em>Provision:</em> ${c.text}<br/><em>Penalty:</em> ${c.penalty}`;
        counterList.appendChild(li);
      });
      legalSec.appendChild(counterList);
    }
    reportContent.appendChild(legalSec);

    // Mediation strategy section
    const medSec = document.createElement('div');
    medSec.classList.add('mb-4');
    const medTitle = document.createElement('h3');
    medTitle.textContent = 'Mediation / Conciliation Strategy';
    medSec.appendChild(medTitle);
    // Objectives
    const objH4 = document.createElement('h4');
    objH4.textContent = 'Mediation Objectives';
    medSec.appendChild(objH4);
    const objList = document.createElement('ul');
    data.mediation.objectives.forEach((o) => {
      const li = document.createElement('li');
      li.textContent = o;
      objList.appendChild(li);
    });
    medSec.appendChild(objList);
    // Issues for mediation and not
    const issuesH4 = document.createElement('h4');
    issuesH4.textContent = 'Issues Suitable for Mediation';
    medSec.appendChild(issuesH4);
    const issuesList = document.createElement('ul');
    data.mediation.issues.forEach((o) => {
      const li = document.createElement('li');
      li.textContent = o;
      issuesList.appendChild(li);
    });
    medSec.appendChild(issuesList);
    const notH4 = document.createElement('h4');
    notH4.textContent = 'Issues NOT Suitable for Mediation';
    medSec.appendChild(notH4);
    const notList = document.createElement('ul');
    data.mediation.notForMediation.forEach((o) => {
      const li = document.createElement('li');
      li.textContent = o;
      notList.appendChild(li);
    });
    medSec.appendChild(notList);
    const expH4 = document.createElement('h4');
    expH4.textContent = 'Expected Outcomes & Settlement Possibilities';
    medSec.appendChild(expH4);
    const expList = document.createElement('ul');
    data.mediation.outcomes.forEach((o) => {
      const li = document.createElement('li');
      li.textContent = o;
      expList.appendChild(li);
    });
    medSec.appendChild(expList);
    reportContent.appendChild(medSec);

    // Strategic questions section
    const questionsSec = document.createElement('div');
    questionsSec.classList.add('mb-4');
    const questTitle = document.createElement('h3');
    questTitle.textContent = 'Strategic Questions for Mediation';
    questionsSec.appendChild(questTitle);
    // For each party
    ['Complainant', 'Respondent'].forEach((roleLabel) => {
      const roleKey = roleLabel.toLowerCase();
      const qs = data.questions[roleKey];
      const roleHeader = document.createElement('h4');
      roleHeader.textContent = roleLabel;
      questionsSec.appendChild(roleHeader);
      ['openEnded', 'clarifying', 'reflective', 'exploratory', 'conscience'].forEach((category) => {
        const catHeader = document.createElement('h5');
        // Format label nicely
        const labelMap = {
          openEnded: 'Open‑Ended Questions',
          clarifying: 'Clarifying Questions',
          reflective: 'Reflective Questions',
          exploratory: 'Exploratory Questions',
          conscience: 'Questions Appealing to Conscience',
        };
        catHeader.textContent = labelMap[category];
        catHeader.classList.add('mt-3');
        questionsSec.appendChild(catHeader);
        const list = document.createElement('ul');
        qs[category].forEach((q) => {
          const li = document.createElement('li');
          li.textContent = q;
          list.appendChild(li);
        });
        questionsSec.appendChild(list);
      });
    });
    reportContent.appendChild(questionsSec);

    // Disclaimer
    const disclaimer = document.createElement('p');
    disclaimer.classList.add('mt-4', 'fst-italic');
    disclaimer.textContent =
      'Disclaimer: This report is generated for informational purposes only and does not constitute legal advice. Barangay officials and parties should consult a qualified lawyer for definitive legal counsel.';
    reportContent.appendChild(disclaimer);
  }

  // Download report as PDF
  async function downloadReportAsPDF() {
    const reportEl = document.getElementById('reportContent');
    const { jsPDF } = window.jspdf;
    // Use html2canvas to capture the report section
    const canvas = await html2canvas(reportEl, { scale: 2, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    // Calculate the number of pages and scale factor
    const imgProps = { width: canvas.width, height: canvas.height };
    const pdfWidth = pageWidth;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    if (pdfHeight < pageHeight) {
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    } else {
      // If the content is taller than one page, split into pages
      let position = 0;
      let heightLeft = pdfHeight;
      let canvasHeight = imgProps.height;
      const ratio = imgProps.width / imgProps.height;
      while (heightLeft > 0) {
        pdf.addImage(
          imgData,
          'PNG',
          0,
          position,
          pdfWidth,
          pdfHeight
        );
        heightLeft -= pageHeight;
        if (heightLeft > 0) {
          pdf.addPage();
          position = 0;
        }
      }
    }
    pdf.save(`barangay_case_report_${Date.now()}.pdf`);
  }

  // Print report using browser print functionality
  function printReport() {
    window.print();
  }

  // Gather data from the form and build report data object
  function gatherData() {
    const caseId = document.getElementById('caseId').value.trim();
    const dateReceived = document.getElementById('dateReceived').value;
    const complainant = {
      name: document.getElementById('complainantName').value.trim(),
      phone: document.getElementById('complainantPhone').value.trim(),
      email: document.getElementById('complainantEmail').value.trim(),
      address: document.getElementById('complainantAddress').value.trim(),
    };
    // Respondents
    const respondentElems = document.querySelectorAll('#respondentContainer .respondent');
    const respondents = [];
    respondentElems.forEach((div) => {
      const name = div.querySelector('.respondent-name').value.trim();
      const phone = div.querySelector('.respondent-phone').value.trim();
      const email = div.querySelector('.respondent-email').value.trim();
      const address = div.querySelector('.respondent-address').value.trim();
      // Only include if at least one field is filled
      if (name || phone || email || address) {
        respondents.push({ name, phone, email, address });
      }
    });
    const incident = {
      summary: document.getElementById('incidentSummary').value.trim(),
      location: document.getElementById('incidentLocation').value.trim(),
      dateTime: document.getElementById('incidentDateTime').value,
    };
    // Auto-generate case title
    let caseTitle = 'Complainant Case';
    if (complainant.name) {
      caseTitle = `${complainant.name} Case`;
    }
    return { caseId, dateReceived, complainant, respondents, incident, caseTitle };
  }

  // Main handler to generate report
  function generateReport() {
    if (!validateForm()) {
      // scroll to top to show error messages
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const formData = gatherData();
    const classification = classifyCase(formData.incident.summary);
    const analysis = LEGAL_DATA[classification];
    const mediation = generateMediationStrategy(classification);
    const questions = {
      complainant: generateQuestions(classification, 'complainant', formData.incident.location, formData.incident.dateTime),
      respondent: generateQuestions(classification, 'respondent', formData.incident.location, formData.incident.dateTime),
    };
    const reportData = {
      ...formData,
      analysis,
      mediation,
      questions,
    };
    renderReport(reportData);
    // Show report section
    document.getElementById('reportSection').classList.remove('d-none');
    // Scroll to report
    document.getElementById('reportSection').scrollIntoView({ behavior: 'smooth' });
  }

  // Event listeners
  document.getElementById('addRespondentBtn').addEventListener('click', () => {
    addRespondent();
  });
  document.getElementById('respondentContainer').addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-respondent')) {
      removeRespondent(e.target);
    }
  });
  document.getElementById('generateBtn').addEventListener('click', generateReport);
  document.getElementById('downloadPdfBtn').addEventListener('click', downloadReportAsPDF);
  document.getElementById('printBtn').addEventListener('click', printReport);
  // Clear form hides report
  document.getElementById('clearBtn').addEventListener('click', () => {
    document.getElementById('reportSection').classList.add('d-none');
    // Reset respondent list to a single blank entry
    const container = document.getElementById('respondentContainer');
    // Remove all existing respondent elements
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    // Create a new respondent template
    const template = document.createElement('div');
    template.className = 'respondent mb-3 border rounded p-3';
    template.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h6 class="mb-0">Respondent <span class="respondent-index">1</span></h6>
        <button type="button" class="btn btn-sm btn-outline-danger remove-respondent" title="Remove respondent" style="display:none;">Remove</button>
      </div>
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Full Name</label>
          <input type="text" class="form-control respondent-name" placeholder="e.g., Pedro Santos" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Phone Number</label>
          <input type="tel" class="form-control respondent-phone" placeholder="09XX XXX XXXX" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Email Address</label>
          <input type="email" class="form-control respondent-email" placeholder="name@example.com" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Complete Address</label>
          <textarea class="form-control respondent-address" rows="2" placeholder="House No., Street, Barangay, City"></textarea>
        </div>
      </div>
    `;
    container.appendChild(template);
    refreshRespondentIndices();
  });
})();