# GranaBox - Frontend

This is the frontend of the **GranaBox** application, developed as part of the **Software Engineering** course at **PUC Rio**. The GranaBox application is designed to help users manage their personal finances by categorizing income and expenses, providing a simple and intuitive dashboard to track their financial status in real-time.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Overview

GranaBox is a personal finance management tool that enables users to:
- Organize their income and expenses by categories.
- Track their monthly financial status in an intuitive dashboard.
- Add, edit, and delete transactions, reflecting real-time updates.
- View financial summaries, such as pending payments, completed transactions, and overall income.

This frontend communicates with the GranaBox backend API, where the data is managed and stored.

## Features

- **Interactive Dashboard**: Displays categorized transactions and financial progress.
- **Dynamic Form Modals**: Add or update transactions with real-time interaction.
- **Drag and Drop Interface**: Easily move items between categories (e.g., from pending to paid).
- **RESTful API Integration**: Communicates with the backend to fetch, create, and update data.
- **Responsive Design**: Ensures smooth usage across desktop and mobile devices.

## Technologies

The following technologies were used in the development of this project:

- **HTML5**: For structuring the frontend content.
- **CSS3**: For layout and styling.
- **JavaScript (Vanilla)**: For frontend logic and interaction.

## Installation

### Prerequisites
Before running the project, ensure you have the following installed:
- A modern web browser (Chrome, Firefox, etc.)

### Steps

1. **Clone the repository**:

   ```bash
   git clone https://github.com/thiagosnuness/granabox_frontend.git
   ```

2. **Navigate to the project folder**:

   ```bash
   cd granabox_frontend
   ```

3. **Run the frontend**:
   
   - You can either open `index.html` directly in your browser by double-clicking on the file.

## Usage

### Adding Transactions
1. Click on the **Add Transaction** button.
2. Fill out the transaction details (category, amount, date).
3. Click **Save** to submit. The transaction will appear in the appropriate section (Income or Expenses).

### Managing Transactions
- **Drag and Drop** transactions between the **Pending** and **Paid** sections.
- **Edit**: Click the edit icon next to a transaction to modify its details.
- **Delete**: Remove a transaction by clicking the delete icon.

### Filtering by Date
1. Use the **Month** and **Year** selectors to view transactions from specific periods.
2. The dashboard will automatically update based on the selected filters.

## Contributing

Contributions are welcome! To contribute to this project:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Create a new Pull Request.

## License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for more details.

## Contact

For any questions, feedback, or suggestions, feel free to reach out:

- **Thiago Nunes** - [GitHub Profile](https://github.com/thiagosnuness)
- **Project Frontend Repository**: [GranaBox Frontend](https://github.com/thiagosnuness/granabox_frontend)
- **Project Backend Repository**: [GranaBox Backend](https://github.com/thiagosnuness/granabox_backend)
