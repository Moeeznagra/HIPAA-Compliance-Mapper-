export interface Safeguard {
  id: string;
  section: string;
  title: string;
  description: string;
  specificationType: 'REQUIRED' | 'ADDRESSABLE';
}

export const HIPAA_SAFEGUARDS: Safeguard[] = [
  {
    id: "164.308(a)(1)(ii)(A)",
    section: "Administrative Safeguards",
    title: "Risk Analysis",
    description: "Conduct an accurate and thorough assessment of the potential risks and vulnerabilities to the confidentiality, integrity, and availability of electronic protected health information held by the covered entity or business associate.",
    specificationType: "REQUIRED"
  },
  {
    id: "164.308(a)(1)(ii)(B)",
    section: "Administrative Safeguards",
    title: "Risk Management",
    description: "Implement security measures sufficient to reduce risks and vulnerabilities to a reasonable and appropriate level to comply with §164.306(a).",
    specificationType: "REQUIRED"
  },
  {
    id: "164.308(a)(4)(i)",
    section: "Administrative Safeguards",
    title: "Information Access Management",
    description: "Implement policies and procedures for authorizing access to electronic protected health information that are consistent with the applicable requirements of subpart E of this part.",
    specificationType: "REQUIRED"
  },
  {
    id: "164.310(a)(1)",
    section: "Physical Safeguards",
    title: "Facility Access Controls",
    description: "Implement policies and procedures to limit physical access to its electronic information systems and the facility or facilities in which they are housed, while ensuring that properly authorized access is allowed.",
    specificationType: "REQUIRED"
  },
  {
    id: "164.312(a)(1)",
    section: "Technical Safeguards",
    title: "Access Control",
    description: "Implement technical policies and procedures for electronic information systems that maintain electronic protected health information to allow access only to those persons or software programs that have been granted access rights.",
    specificationType: "REQUIRED"
  },
  {
    id: "164.312(b)",
    section: "Technical Safeguards",
    title: "Audit Controls",
    description: "Implement hardware, software, and/or procedural mechanisms that record and examine activity in information systems that contain or use electronic protected health information.",
    specificationType: "REQUIRED"
  },
  {
    id: "164.312(c)(1)",
    section: "Technical Safeguards",
    title: "Integrity",
    description: "Implement policies and procedures to protect electronic protected health information from improper alteration or destruction.",
    specificationType: "REQUIRED"
  },
  {
    id: "164.312(e)(1)",
    section: "Technical Safeguards",
    title: "Transmission Security",
    description: "Implement technical security measures to guard against unauthorized access to electronic protected health information that is being transmitted over an electronic communications network.",
    specificationType: "REQUIRED"
  }
];
