import { Contact } from "@prisma/client";
import CustomException from "../helpers/customException";
import prismaClient from "../prisma/client";

interface ContactReq {
  phoneNumber: string;
  email: string;
}

const updateContactToSecondary = async (
  contact: Contact,
  primaryId: number
) => {
  await prismaClient.contact.update({
    where: { id: contact.id },
    data: {
      linkPrecedence: "SECONDARY",
      linkedId: primaryId,
    },
  });
};

export const createContact = async (data: ContactReq) => {
  const { phoneNumber, email } = data;

  if (!phoneNumber && !email) {
    throw new CustomException("Phone number or email is required", 400);
  }

  const contactExists = await prismaClient.contact.findFirst({
    where: {
      AND: [{ phoneNumber }, { email }, { deletedAt: null }],
    },
  });
  if (contactExists) {
    throw new CustomException("Contact already exists", 419);
  }

  const relatedContacts = await prismaClient.contact.findMany({
    where: {
      deletedAt: null,
      OR: [{ email }, { phoneNumber }],
    },
  });

  let primaryContact: Contact;

  if (relatedContacts.length === 0) {
    primaryContact = await prismaClient.contact.create({
      data: {
        phoneNumber,
        email,
        linkedId: null,
        linkPrecedence: "PRIMARY",
        deletedAt: null,
      },
    });
  } else {
    const primaryContacts = relatedContacts.filter(
      (c) => c.linkPrecedence === "PRIMARY"
    );

    primaryContact = (
      primaryContacts.length > 0 ? primaryContacts : relatedContacts
    ).reduce((earliest, current) =>
      current.createdAt < earliest.createdAt ? current : earliest
    );

    const otherPrimaryContacts = primaryContacts.filter(
      (c) => c.id !== primaryContact.id
    );
    await Promise.all(
      otherPrimaryContacts.map((c) =>
        updateContactToSecondary(c, primaryContact.id)
      )
    );

    otherPrimaryContacts.length === 0 &&
      (await prismaClient.contact.create({
        data: {
          phoneNumber,
          email,
          linkedId: primaryContact.id,
          linkPrecedence: "SECONDARY",
          deletedAt: null,
        },
      }));
  }

  const allLinkedContacts = await prismaClient.contact.findMany({
    where: {
      deletedAt: null,
      OR: [{ id: primaryContact.id }, { linkedId: primaryContact.id }],
    },
  });

  const emailSet = new Set<string>();
  const phoneSet = new Set<string>();
  const emails: string[] = [];
  const phoneNumbers: string[] = [];

  if (primaryContact.email) {
    emails.push(primaryContact.email);
    emailSet.add(primaryContact.email);
  }

  if (primaryContact.phoneNumber) {
    phoneNumbers.push(primaryContact.phoneNumber);
    phoneSet.add(primaryContact.phoneNumber);
  }

  for (const contact of allLinkedContacts) {
    if (contact.id === primaryContact.id) continue;

    if (contact.email && !emailSet.has(contact.email)) {
      emails.push(contact.email);
      emailSet.add(contact.email);
    }

    if (contact.phoneNumber && !phoneSet.has(contact.phoneNumber)) {
      phoneNumbers.push(contact.phoneNumber);
      phoneSet.add(contact.phoneNumber);
    }
  }

  const secondaryContactIds = allLinkedContacts
    .filter((c) => c.linkPrecedence === "SECONDARY")
    .map((c) => c.id);

  return {
    contact: {
      primaryContatctId: primaryContact.id,
      emails,
      phoneNumbers,
      secondaryContactIds,
    },
  };
};
