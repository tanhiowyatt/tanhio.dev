import type { SkillCategoryConfig, SkillItem } from "@/config/types";

export const skillsSectionConfig = {
  title: "Stack",
  categories: [
    { id: "language", label: "Language" },
    { id: "recon", label: "Scanning" },
    { id: "web", label: "Web" },
    { id: "exploitation", label: "Exploitation" },
  ] as SkillCategoryConfig[],
};

export const skillsConfig: SkillItem[] = [
  // 01 Language
  {
    id: "python",
    name: "Python",
    icon: "python",
    category: "language",
    order: 1,
    enabled: true,
  },
  {
    id: "bash",
    name: "Bash",
    icon: "bash",
    category: "language",
    order: 2,
    enabled: true,
  },

  // 02 Scanning
  {
    id: "nmap",
    name: "Nmap",
    icon: "nmap",
    category: "recon",
    order: 3,
    enabled: true,
  },
  {
    id: "ffuf",
    name: "ffuf / Gobuster",
    icon: "ffuf",
    category: "recon",
    order: 4,
    enabled: true,
  },
  {
    id: "amass",
    name: "Amass / Subfinder",
    icon: "amass",
    category: "recon",
    order: 5,
    enabled: true,
  },
  {
    id: "wireshark",
    name: "Wireshark",
    icon: "wireshark",
    category: "recon",
    order: 6,
    enabled: true,
  },

  // 03 Web
  {
    id: "burp",
    name: "Burp Suite",
    icon: "burp",
    category: "web",
    order: 7,
    enabled: true,
  },
  {
    id: "zap",
    name: "OWASP ZAP",
    icon: "zap",
    category: "web",
    order: 8,
    enabled: true,
  },
  {
    id: "sqlmap",
    name: "SQLmap",
    icon: "sqlmap",
    category: "web",
    order: 9,
    enabled: true,
  },
  {
    id: "nuclei",
    name: "Nuclei",
    icon: "nuclei",
    category: "web",
    order: 10,
    enabled: true,
  },

  // 04 Exploitation
  {
    id: "metasploit",
    name: "Metasploit",
    icon: "metasploit",
    category: "exploitation",
    order: 11,
    enabled: true,
  },
  {
    id: "netcat",
    name: "Netcat",
    icon: "netcat",
    category: "exploitation",
    order: 12,
    enabled: true,
  },
  {
    id: "searchsploit",
    name: "Searchsploit",
    icon: "searchsploit",
    category: "exploitation",
    order: 13,
    enabled: true,
  },
  {
    id: "bloodhound",
    name: "BloodHound",
    icon: "bloodhound",
    category: "exploitation",
    order: 14,
    enabled: true,
  },
  {
    id: "mimikatz",
    name: "Mimikatz",
    icon: "mimikatz",
    category: "exploitation",
    order: 15,
    enabled: true,
  },
];
