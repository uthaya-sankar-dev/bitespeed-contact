# Contact Identity Resolver API

This Node.js service deduplicates and links contact records based on email and phone number. It ensures a single primary contact is maintained, with any additional matching records marked as secondary.

## Important Missing Test Case (Assessment Clarification)

The [original problem statement](https://bitespeed.notion.site/Bitespeed-Backend-Task-Identity-Reconciliation-1fb21bb2a930802eb896d4409460375c) does not mention what should happen when there are related contacts but none marked as PRIMARY against input request body.(i.e Both email & Phone are from secondary contacts)

### Example

```json
[
  {
    "id": 1,
    "phoneNumber": "12345678",
    "email": "uthaya@gmail.com",
    "linkedId": null,
    "linkPrecedence": "PRIMARY",
    "createdAt": "2025-06-03 09:28:44.721",
    "updatedAt": "2025-06-03 09:28:44.721",
    "deletedAt": null
  },
  {
    "id": 2,
    "phoneNumber": "12345678",
    "email": "sankar@gmail.com",
    "linkedId": 1,
    "linkPrecedence": "SECONDARY",
    "createdAt": "2025-06-03 09:28:51.947",
    "updatedAt": "2025-06-03 09:28:51.947",
    "deletedAt": null
  },
  {
    "id": 3,
    "phoneNumber": "123456789",
    "email": "uthaya@gmail.com",
    "linkedId": 1,
    "linkPrecedence": "SECONDARY",
    "createdAt": "2025-06-03 09:29:02.322",
    "updatedAt": "2025-06-03 09:29:02.322",
    "deletedAt": null
  }
]
```

Identify request:

Both email & Phone are from secondary contact.

```json
{
  "phoneNumber": "123456789",
  "email": "sankar@gmail.com"
}
```

New State of database

```json
[
  {
    "id": 1,
    "phoneNumber": "12345678",
    "email": "uthaya@gmail.com",
    "linkedId": null,
    "linkPrecedence": "PRIMARY",
    "createdAt": "2025-06-03 09:28:44.721",
    "updatedAt": "2025-06-03 09:28:44.721",
    "deletedAt": null
  },
  {
    "id": 2,
    "phoneNumber": "12345678",
    "email": "sankar@gmail.com",
    "linkedId": 1,
    "linkPrecedence": "SECONDARY",
    "createdAt": "2025-06-03 09:28:51.947",
    "updatedAt": "2025-06-03 09:28:51.947",
    "deletedAt": null
  },
  {
    "id": 3,
    "phoneNumber": "123456789",
    "email": "uthaya@gmail.com",
    "linkedId": 1,
    "linkPrecedence": "SECONDARY",
    "createdAt": "2025-06-03 09:29:02.322",
    "updatedAt": "2025-06-03 09:29:02.322",
    "deletedAt": null
  },
  {
    "id": 4,
    "phoneNumber": "123456789",
    "email": "sankar@gmail.com",
    "linkedId": 2,
    "linkPrecedence": "SECONDARY",
    "createdAt": "2025-06-03 09:28:51.947",
    "updatedAt": "2025-06-03 09:28:51.947",
    "deletedAt": null
  }
]
```

Note: Using oldest Secondary contact in linking the new Contact.

## Deployed URL

**API Endpoint:** : [TBA]("")

## Tech Stack

- **Node.js**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL**
- **Express.js**

## API Endpoint

### `POST /identify`

Creates or links a contact based on the given email and/or phone number.

#### Request Body

```json
{
  "email": "john@example.com",
  "phoneNumber": "1234567890"
}
```
