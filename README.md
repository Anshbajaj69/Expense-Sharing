# Daily Expenses Sharing Application

A robust backend solution for managing and splitting daily expenses among multiple users. Built with Node.js, Express, and MongoDB, this application provides flexible expense splitting methods and comprehensive balance tracking.

## Features

- **Multiple Split Methods**: Support for equal, exact amount, and percentage-based expense splitting
- **User Management**: Complete authentication system with JWT-based security
- **Balance Tracking**: Real-time balance calculation for all users
- **Excel Reports**: Generate and download detailed balance sheets
- **Secure Authentication**: Password hashing with bcrypt and token-based sessions
- **Flexible Login**: Support for email, mobile, or username-based login
- **RESTful API**: Well-structured endpoints for seamless integration

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens), bcrypt
- **File Generation**: xlsx for Excel reports
- **Additional**: cookie-parser, CORS, dotenv

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
   git clone https://github.com/Anshbajaj69/Expense-Sharing.git
   cd Expense-Sharing
```

2. Install dependencies:
```bash
   npm install
```

3. Configure environment variables:
   
   Create a `.env` file in the root directory:
```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   NODE_ENV=development
```

4. Start the development server:
```bash
   npm run dev
```

The server will start on `http://localhost:5000` (or your specified PORT)

## API Documentation

### Authentication Endpoints

#### Register New User
```http
POST /api/auth/signup
```
**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "mobile": "1234567890"
}
```
**Response:** Returns user object and JWT token

#### User Login
```http
POST /api/auth/login
```
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```
**Response:** Returns JWT token and user details

#### Get Current User
```http
GET /api/auth/getuser
```
**Headers:** `Authorization: Bearer <token>`

**Response:** Current user's profile information

#### Get All Users
```http
GET /api/auth/all
```
**Headers:** `Authorization: Bearer <token>`

**Response:** List of all registered users

### Expense Management Endpoints

#### Retrieve All Expenses
```http
GET /api/expense/get
```
**Headers:** `Authorization: Bearer <token>`

**Response:** All expenses where the user is creator or participant

#### Create New Expense
```http
POST /api/expense/add
```
**Headers:** `Authorization: Bearer <token>`

**Request Body (Equal Split):**
```json
{
  "description": "Dinner at Restaurant",
  "amount": 3000,
  "participants": ["userId1", "userId2", "userId3"],
  "splitMethod": "equal"
}
```

**Request Body (Exact Split):**
```json
{
  "description": "Shopping",
  "amount": 4299,
  "participants": ["userId1", "userId2"],
  "splitMethod": "exact",
  "exactAmounts": [
    { "userId": "userId1", "amount": 799 },
    { "userId": "userId2", "amount": 3500 }
  ]
}
```

**Request Body (Percentage Split):**
```json
{
  "description": "Project Expenses",
  "amount": 5000,
  "participants": ["userId1", "userId2", "userId3"],
  "splitMethod": "percentage",
  "percentages": [
    { "userId": "userId1", "percentage": 50, "amount": 2500},
    { "userId": "userId2", "percentage": 30, "amount": 1500},
    { "userId": "userId3", "percentage": 20, "amount": 1000}
  ]
}
```

#### View Balance Sheet
```http
GET /api/expense/balance-sheet
```
**Headers:** `Authorization: Bearer <token>`

**Response:** Detailed balance information including amounts owed and amounts to receive

#### Download Balance Sheet (Excel)
```http
POST /api/expense/generate-balance-sheet
```
**Headers:** `Authorization: Bearer <token>`

**Response:** Downloadable Excel file containing complete balance information

## Database Schema

### User Collection

| Field    | Type   | Constraints           |
|----------|--------|-----------------------|
| username | String | Required              |
| email    | String | Required, Unique      |
| password | String | Required (Hashed)     |
| mobile   | String | Required              |

### Expense Collection

| Field          | Type                          | Description                                    |
|----------------|-------------------------------|------------------------------------------------|
| userId         | ObjectId (ref: User)          | Expense creator                                |
| description    | String                        | Expense description                            |
| amount         | Number                        | Total expense amount                           |
| participants   | Array of ObjectIds            | Users involved in the expense                  |
| splitMethod    | String (enum)                 | Split type: equal/exact/percentage             |
| exactAmounts   | Array of Objects              | For exact split (userId, amount)               |
| percentages    | Array of Objects              | For percentage split (userId, percentage, amount)      |
| createdAt      | Date                          | Auto-generated timestamp                       |
| updatedAt      | Date                          | Auto-updated timestamp                         |

## Validation Rules

- **Exact Split**: Sum of all exact amounts must equal the total expense amount
- **Percentage Split**: Sum of all percentages must equal 100%
- **Equal Split**: Automatically divides the amount equally among all participants
- **Participants**: Expense creator must be included in the participants list
- **Amount**: Must be a positive number greater than zero

## Error Handling

The application includes comprehensive error handling for:
- Invalid authentication credentials
- Malformed request data
- Database connection issues
- Validation failures
- Unauthorized access attempts

All errors return appropriate HTTP status codes with descriptive error messages.

## Security Features

- Password hashing using bcrypt with salt rounds
- JWT-based stateless authentication
- Protected routes with authorization middleware
- Input validation and sanitization
- Secure HTTP headers with CORS configuration
- Environment variable management for sensitive data

## Development

### Project Structure
```
├── controllers/       # Route controllers
├── models/           # Database models
├── routes/           # API routes
├── middleware/       # Custom middleware
├── utils/            # Helper functions
├── config/           # Configuration files
└── server.js         # Application entry point
```

### Running Tests
```bash
npm test
```

### Code Formatting
```bash
npm run format
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## Contact

For questions or support, please open an issue on GitHub.

[![GitHub](https://img.shields.io/badge/GitHub-Anshbajaj69-181717?style=flat-square&logo=github)](https://github.com/Anshbajaj69)

[![Email](https://img.shields.io/badge/Email-bajajansh822@gmail.com-red?style=flat-square&logo=gmail&logoColor=white)](mailto:bajajansh822@gmail.com)


---

**Note**: This application is designed for educational and personal use. Ensure proper security measures are implemented before deploying to production.

