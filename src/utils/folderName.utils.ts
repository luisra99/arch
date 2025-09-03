export const getProspectFolderName = (p: {
  name?: string;
  address?: string;
  email?: string;
  phone?: string;
  createdAt: Date;
}): string => {
  if (p?.name && p?.address) return `${p?.name} - ${p?.address}`;
  if (p?.name && p?.email) return `${p?.name} - ${p?.email}`;
  if (p?.email && p?.createdAt) return `${p?.email} - ${p?.createdAt?.toISOString()?.split("T")[0]}`;
  if (p?.name) return p?.name;
  if (p?.email) return p?.email;
  if(p?.createdAt) return p?.createdAt?.toISOString()?.split?.("T")[0];
  return (new Date())?.toISOString()?.split?.("T")[0];
};

