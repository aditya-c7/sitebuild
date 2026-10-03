// DSA lab programs served as plain text from /api/1 … /api/6.
//
// Every route returns the program number, title and the lab question as a
// short C comment, followed by the full source — so `curl /api/N` shows what
// the program is and then prints all of it. The comment means the ?dl=1
// download is still valid C.
// Sources are String.raw template literals on purpose: the C code contains
// escape sequences (`"\n"`, `" %[^\n]"`) that a normal template literal would
// turn into real newlines and corrupt the output.
// The source text starts at column 0 for the same reason: no leading indent.

export type CProgram = {
  /** 1-based program number → served at /api/<id> */
  id: number;
  title: string;
  /** the lab question this program answers, printed above the source */
  question: string;
  /** suggested filename for ?dl=1 */
  filename: string;
  source: string;
};

/** Word-wrap so the question stays a tidy block. */
function wrap(text: string, width = 64): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if (line && line.length + 1 + word.length > width) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Heading printed above every program: program number, title, then the lab
 * question. Kept as a C comment so the ?dl=1 download is still valid C.
 */
function banner(program: CProgram): string {
  const question = wrap(program.question);
  return (
    [
      `/* PROGRAM ${program.id}: ${program.title}`,
      ...question.map(
        (line, i) =>
          `${i === 0 ? "   QUESTION: " : "             "}${line}${i === question.length - 1 ? " */" : ""}`
      ),
    ].join("\n") + "\n\n"
  );
}

export const C_PROGRAMS: CProgram[] = [
  {
    id: 1,
    title: "Library Book Management System",
    question:
      "Store book records using structures and dynamic memory allocation, with a menu-driven interface for create, display, search, issue and return operations.",
    filename: "program1-library-management.c",
    source: String.raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    int book_id;
    char title[100];
    char author[100];
    float price;
    char availability_status[15];
} Book;

Book* create(int *n);
void display(Book *books, int n);
void search(Book *books, int n);
void issueBook(Book *books, int n);
void returnBook(Book *books, int n);

int main() {
    Book *books = NULL;
    int n = 0;
    int choice;

    while (1) {
        printf("\n================ LIBRARY MENU ================\n");
        printf("1. Add Book Records\n");
        printf("2. Display all Book Records\n");
        printf("3. Search Book by Book ID\n");
        printf("4. Issue a Book\n");
        printf("5. Return a Book\n");
        printf("6. Exit\n");
        printf("Enter your choice (1-6): ");
        if (scanf("%d", &choice) != 1) {
            printf("Invalid input! Exiting program.\n");
            break;
        }

        switch (choice) {
            case 1:
                if (books != NULL) {
                    free(books);
                    books = NULL;
                }
                books = create(&n);
                break;
            case 2:
                display(books, n);
                break;
            case 3:
                search(books, n);
                break;
            case 4:
                issueBook(books, n);
                break;
            case 5:
                returnBook(books, n);
                break;
            case 6:
                if (books != NULL) {
                    free(books);
                }
                printf("Exiting program. Goodbye!\n");
                return 0;
            default:
                printf("Invalid choice! Please select between 1 and 6.\n");
        }
    }

    if (books != NULL) {
        free(books);
    }
    return 0;
}

Book* create(int *n) {
    printf("Enter the number of books (N): ");
    scanf("%d", n);

    if (*n <= 0) {
        printf("Invalid count. Setting book count to 0.\n");
        *n = 0;
        return NULL;
    }

    Book *books = (Book *)malloc((*n) * sizeof(Book));
    if (books == NULL) {
        printf("Memory allocation failed!\n");
        *n = 0;
        return NULL;
    }

    for (int i = 0; i < *n; i++) {
        printf("\n--- Enter Details for Book %d ---\n", i + 1);
        printf("Book ID: ");
        scanf("%d", &books[i].book_id);

        printf("Title: ");
        scanf(" %[^\n]", books[i].title);

        printf("Author: ");
        scanf(" %[^\n]", books[i].author);

        printf("Price: ");
        scanf("%f", &books[i].price);

        strcpy(books[i].availability_status, "Available");
    }

    printf("\nSuccessfully added %d book record(s).\n", *n);
    return books;
}

void display(Book *books, int n) {
    if (books == NULL || n == 0) {
        printf("\nNo book records found! Please add books first.\n");
        return;
    }

    printf("\n%-10s %-25s %-20s %-10s %-15s\n", "Book ID", "Title", "Author", "Price", "Status");
    printf("--------------------------------------------------------------------------------\n");
    for (int i = 0; i < n; i++) {
        printf("%-10d %-25s %-20s %-10.2f %-15s\n",
               books[i].book_id,
               books[i].title,
               books[i].author,
               books[i].price,
               books[i].availability_status);
    }
}

void search(Book *books, int n) {
    if (books == NULL || n == 0) {
        printf("\nNo books available to search.\n");
        return;
    }

    int id, found = 0;
    printf("Enter Book ID to search: ");
    scanf("%d", &id);

    for (int i = 0; i < n; i++) {
        if (books[i].book_id == id) {
            printf("\nBook Found!\n");
            printf("ID: %d\n", books[i].book_id);
            printf("Title: %s\n", books[i].title);
            printf("Author: %s\n", books[i].author);
            printf("Price: %.2f\n", books[i].price);
            printf("Status: %s\n", books[i].availability_status);
            found = 1;
            break;
        }
    }

    if (!found) {
        printf("\nBook with ID %d not found.\n", id);
    }
}

void issueBook(Book *books, int n) {
    if (books == NULL || n == 0) {
        printf("\nNo books available to issue.\n");
        return;
    }

    int id, found = 0;
    printf("Enter Book ID to issue: ");
    scanf("%d", &id);

    for (int i = 0; i < n; i++) {
        if (books[i].book_id == id) {
            found = 1;
            if (strcmp(books[i].availability_status, "Available") == 0) {
                strcpy(books[i].availability_status, "Issued");
                printf("\nSuccess: Book '%s' (ID: %d) has been issued.\n", books[i].title, books[i].book_id);
            } else {
                printf("\nNotice: Book '%s' (ID: %d) is already issued.\n", books[i].title, books[i].book_id);
            }
            break;
        }
    }

    if (!found) {
        printf("\nBook with ID %d not found.\n", id);
    }
}

void returnBook(Book *books, int n) {
    if (books == NULL || n == 0) {
        printf("\nNo books to return.\n");
        return;
    }

    int id, found = 0;
    printf("Enter Book ID to return: ");
    scanf("%d", &id);

    for (int i = 0; i < n; i++) {
        if (books[i].book_id == id) {
            found = 1;
            if (strcmp(books[i].availability_status, "Issued") == 0) {
                strcpy(books[i].availability_status, "Available");
                printf("\nSuccess: Book '%s' (ID: %d) has been returned and is now available.\n", books[i].title, books[i].book_id);
            } else {
                printf("\nNotice: Book '%s' (ID: %d) was not issued (currently marked Available).\n", books[i].title, books[i].book_id);
            }
            break;
        }
    }

    if (!found) {
        printf("\nBook with ID %d not found.\n", id);
    }
}
`,
  },
  {
    id: 2,
    title: "Sparse Matrix Operations",
    question:
      "Represent a sparse matrix in triplet form and perform addition and transpose on it.",
    filename: "program2-sparse-matrix.c",
    source: String.raw`#include <stdio.h>
#include <stdlib.h>

#define MAX 100

typedef struct {
    int row;
    int col;
    int val;
} Term;

void readSparseMatrix(Term a[], int *rows, int *cols) {
    int element, k = 1;
    printf("Enter number of rows and columns: ");
    scanf("%d %d", rows, cols);

    a[0].row = *rows;
    a[0].col = *cols;

    printf("Enter the matrix elements (%d x %d):\n", *rows, *cols);
    for (int i = 0; i < *rows; i++) {
        for (int j = 0; j < *cols; j++) {
            scanf("%d", &element);
            if (element != 0) {
                a[k].row = i;
                a[k].col = j;
                a[k].val = element;
                k++;
            }
        }
    }
    a[0].val = k - 1;
}

void displayTriplet(Term a[]) {
    if (a[0].val == 0) {
        printf("Matrix is completely zero.\n");
        return;
    }
    printf("\nRow\tCol\tValue\n");
    printf("---------------------\n");
    for (int i = 0; i <= a[0].val; i++) {
        printf("%d\t%d\t%d\n", a[i].row, a[i].col, a[i].val);
    }
}

void transposeSparse(Term a[], Term b[]) {
    int k = 1;
    b[0].row = a[0].col;
    b[0].col = a[0].row;
    b[0].val = a[0].val;

    if (a[0].val > 0) {
        for (int col = 0; col < a[0].col; col++) {
            for (int i = 1; i <= a[0].val; i++) {
                if (a[i].col == col) {
                    b[k].row = a[i].col;
                    b[k].col = a[i].row;
                    b[k].val = a[i].val;
                    k++;
                }
            }
        }
    }
}

int addSparse(Term a[], Term b[], Term sum[]) {
    if (a[0].row != b[0].row || a[0].col != b[0].col) {
        return 0;
    }

    int i = 1, j = 1, k = 1;
    sum[0].row = a[0].row;
    sum[0].col = a[0].col;

    while (i <= a[0].val && j <= b[0].val) {
        if (a[i].row < b[j].row || (a[i].row == b[j].row && a[i].col < b[j].col)) {
            sum[k++] = a[i++];
        } else if (b[j].row < a[i].row || (b[j].row == a[i].row && b[j].col < a[i].col)) {
            sum[k++] = b[j++];
        } else {
            int addedVal = a[i].val + b[j].val;
            if (addedVal != 0) {
                sum[k].row = a[i].row;
                sum[k].col = a[i].col;
                sum[k].val = addedVal;
                k++;
            }
            i++;
            j++;
        }
    }

    while (i <= a[0].val) {
        sum[k++] = a[i++];
    }

    while (j <= b[0].val) {
        sum[k++] = b[j++];
    }

    sum[0].val = k - 1;
    return 1;
}

int main() {
    Term A[MAX], B[MAX], T[MAX], Sum[MAX];
    int r1, c1, r2, c2;
    int choice;

    while (1) {
        printf("\n========= SPARSE MATRIX OPERATIONS =========\n");
        printf("1. Input Matrices (A and B)\n");
        printf("2. Display Triplet Representation\n");
        printf("3. Transpose Matrix A\n");
        printf("4. Add Matrices (A + B)\n");
        printf("5. Exit\n");
        printf("Enter your choice (1-5): ");
        if (scanf("%d", &choice) != 1) {
            printf("Invalid input. Exiting.\n");
            break;
        }

        switch (choice) {
            case 1:
                printf("\n--- Matrix A ---\n");
                readSparseMatrix(A, &r1, &c1);
                printf("\n--- Matrix B ---\n");
                readSparseMatrix(B, &r2, &c2);
                printf("\nMatrices stored successfully.\n");
                break;

            case 2:
                printf("\nTriplet Representation of Matrix A:");
                displayTriplet(A);
                printf("\nTriplet Representation of Matrix B:");
                displayTriplet(B);
                break;

            case 3:
                transposeSparse(A, T);
                printf("\nTranspose of Matrix A:");
                displayTriplet(T);
                break;

            case 4:
                if (addSparse(A, B, Sum)) {
                    printf("\nSum of Matrix A and Matrix B:");
                    displayTriplet(Sum);
                } else {
                    printf("\nError: Dimensions do not match. Addition not possible.\n");
                }
                break;

            case 5:
                printf("Exiting program.\n");
                return 0;

            default:
                printf("Invalid choice! Choose between 1 and 5.\n");
        }
    }
    return 0;
}
`,
  },
  {
    id: 3,
    title: "Stack Operations (Array Implementation)",
    question:
      "Implement a stack with an array (MAX > 15) supporting push, pop, overflow, underflow and display.",
    filename: "program3-stack-operations.c",
    source: String.raw`#include <stdio.h>
#include <stdlib.h>

#define MAX 16

int stack[MAX];
int top = -1;

void push(int value) {
    if (top == MAX - 1) {
        printf("\n[OVERFLOW] Stack is full! Cannot push element %d. (MAX = %d)\n", value, MAX);
        return;
    }
    top++;
    stack[top] = value;
    printf("\nElement %d successfully pushed onto the stack.\n", value);
}

void pop() {
    if (top == -1) {
        printf("\n[UNDERFLOW] Stack is empty! No element to pop.\n");
        return;
    }
    int poppedValue = stack[top];
    top--;
    printf("\nElement %d successfully popped from the stack.\n", poppedValue);
}

void display() {
    if (top == -1) {
        printf("\nStack Status: Empty (top = -1)\n");
        return;
    }

    printf("\n--- STACK STATUS ---\n");
    printf("Top Index   : %d\n", top);
    printf("Total Items : %d / %d\n", top + 1, MAX);
    printf("Stack Elements (from top to bottom):\n");
    for (int i = top; i >= 0; i--) {
        if (i == top) {
            printf("  [%d] -> %d  <-- TOP\n", i, stack[i]);
        } else {
            printf("  [%d] -> %d\n", i, stack[i]);
        }
    }
}

int main() {
    int choice, val;

    while (1) {
        printf("\n============= STACK MENU (MAX: %d) =============\n", MAX);
        printf("1. Push an Element\n");
        printf("2. Pop an Element\n");
        printf("3. Display Stack Status\n");
        printf("4. Exit\n");
        printf("Enter your choice (1-4): ");

        if (scanf("%d", &choice) != 1) {
            printf("Invalid input! Exiting program.\n");
            break;
        }

        switch (choice) {
            case 1:
                printf("Enter integer element to push: ");
                scanf("%d", &val);
                push(val);
                break;

            case 2:
                pop();
                break;

            case 3:
                display();
                break;

            case 4:
                printf("Exiting program. Goodbye!\n");
                return 0;

            default:
                printf("Invalid choice! Please select an option between 1 and 4.\n");
        }
    }

    return 0;
}
`,
  },
  {
    id: 4,
    title: "Printer Queue Simulation",
    question:
      "Simulate a printer queue: add job, process job, show waiting count, handle overflow and underflow.",
    filename: "program4-printer-queue.c",
    source: String.raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX 5

typedef struct {
    int job_id;
    char doc_name[50];
    int pages;
} PrintJob;

PrintJob printerQueue[MAX];
int front = -1;
int rear = -1;

int isFull() {
    return rear == MAX - 1;
}

int isEmpty() {
    return front == -1 || front > rear;
}

void addJob() {
    if (isFull()) {
        printf("\n[OVERFLOW] Printer queue is full! Cannot accept new print jobs (Capacity: %d).\n", MAX);
        return;
    }

    PrintJob job;
    printf("\nEnter Job ID: ");
    scanf("%d", &job.job_id);
    printf("Enter Document Name: ");
    scanf(" %[^\n]", job.doc_name);
    printf("Enter Number of Pages: ");
    scanf("%d", &job.pages);

    if (isEmpty()) {
        front = 0;
        rear = 0;
    } else {
        rear++;
    }

    printerQueue[rear] = job;
    printf("Job [ID: %d, '%s', %d pages] added successfully.\n", job.job_id, job.doc_name, job.pages);
}

void processJob() {
    if (isEmpty()) {
        printf("\n[UNDERFLOW] Printer queue is empty! No jobs to process.\n");
        return;
    }

    PrintJob job = printerQueue[front];
    printf("\nProcessing and printing Job [ID: %d, Document: '%s', Pages: %d]...\n",
           job.job_id, job.doc_name, job.pages);

    front++;

    if (front > rear) {
        front = -1;
        rear = -1;
    }
}

void displayStatus() {
    if (isEmpty()) {
        printf("\nPrinter Status: 0 jobs waiting in the queue.\n");
        return;
    }

    int waitingCount = rear - front + 1;
    printf("\n--- PRINTER QUEUE STATUS ---\n");
    printf("Total jobs waiting: %d\n", waitingCount);
    printf("%-10s %-25s %-10s\n", "Job ID", "Document Name", "Pages");
    printf("---------------------------------------------\n");
    for (int i = front; i <= rear; i++) {
        printf("%-10d %-25s %-10d\n",
               printerQueue[i].job_id,
               printerQueue[i].doc_name,
               printerQueue[i].pages);
    }
}

int main() {
    int choice;

    while (1) {
        printf("\n======= PRINTER QUEUE SIMULATION (MAX: %d) =======\n", MAX);
        printf("1. Add Print Job\n");
        printf("2. Process Print Job (Delete)\n");
        printf("3. Display Waiting Jobs\n");
        printf("4. Exit\n");
        printf("Enter your choice (1-4): ");

        if (scanf("%d", &choice) != 1) {
            printf("Invalid input! Exiting program.\n");
            break;
        }

        switch (choice) {
            case 1:
                addJob();
                break;
            case 2:
                processJob();
                break;
            case 3:
                displayStatus();
                break;
            case 4:
                printf("Exiting Printer Simulation. Goodbye!\n");
                return 0;
            default:
                printf("Invalid choice! Please select an option between 1 and 4.\n");
        }
    }

    return 0;
}
`,
  },
  {
    id: 5,
    title: "Polynomial Addition using SCLL",
    question:
      "Represent polynomials in a singly circular linked list with a header node and compute POLY1 + POLY2 = POLYSUM.",
    filename: "program5-polynomial-addition-scll.c",
    source: String.raw`#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int coeff;
    int expo;
    struct Node *next;
} Node;

Node* createHeaderNode() {
    Node *head = (Node *)malloc(sizeof(Node));
    head->coeff = 0;
    head->expo = -1;
    head->next = head;
    return head;
}

void insertTerm(Node *head, int coeff, int expo) {
    if (coeff == 0) return;

    Node *newNode = (Node *)malloc(sizeof(Node));
    newNode->coeff = coeff;
    newNode->expo = expo;

    Node *curr = head;
    while (curr->next != head) {
        curr = curr->next;
    }

    curr->next = newNode;
    newNode->next = head;
}

void readPolynomial(Node *head) {
    int n, coeff, expo;
    printf("Enter the number of terms in the polynomial: ");
    scanf("%d", &n);

    for (int i = 0; i < n; i++) {
        printf("  Enter term %d (coefficient and exponent): ", i + 1);
        scanf("%d %d", &coeff, &expo);
        insertTerm(head, coeff, expo);
    }
}

void displayPolynomial(Node *head) {
    if (head->next == head) {
        printf("0\n");
        return;
    }

    Node *curr = head->next;
    int isFirst = 1;

    while (curr != head) {
        if (curr->coeff > 0 && !isFirst) {
            printf(" + ");
        } else if (curr->coeff < 0) {
            printf(" - ");
        }

        int absCoeff = abs(curr->coeff);

        if (curr->expo == 0) {
            printf("%d", absCoeff);
        } else if (curr->expo == 1) {
            if (absCoeff == 1) printf("x");
            else printf("%dx", absCoeff);
        } else {
            if (absCoeff == 1) printf("x^%d", curr->expo);
            else printf("%dx^%d", absCoeff, curr->expo);
        }

        isFirst = 0;
        curr = curr->next;
    }
    printf("\n");
}

Node* addPolynomials(Node *poly1, Node *poly2) {
    Node *polySum = createHeaderNode();
    Node *p1 = poly1->next;
    Node *p2 = poly2->next;

    while (p1 != poly1 && p2 != poly2) {
        if (p1->expo == p2->expo) {
            int sumCoeff = p1->coeff + p2->coeff;
            if (sumCoeff != 0) {
                insertTerm(polySum, sumCoeff, p1->expo);
            }
            p1 = p1->next;
            p2 = p2->next;
        } else if (p1->expo > p2->expo) {
            insertTerm(polySum, p1->coeff, p1->expo);
            p1 = p1->next;
        } else {
            insertTerm(polySum, p2->coeff, p2->expo);
            p2 = p2->next;
        }
    }

    while (p1 != poly1) {
        insertTerm(polySum, p1->coeff, p1->expo);
        p1 = p1->next;
    }

    while (p2 != poly2) {
        insertTerm(polySum, p2->coeff, p2->expo);
        p2 = p2->next;
    }

    return polySum;
}

void freeList(Node *head) {
    if (head == NULL) return;
    Node *curr = head->next;
    while (curr != head) {
        Node *temp = curr;
        curr = curr->next;
        free(temp);
    }
    free(head);
}

int main() {
    Node *POLY1 = createHeaderNode();
    Node *POLY2 = createHeaderNode();
    Node *POLYSUM = NULL;

    printf("=== POLYNOMIAL ADDITION USING CIRCULAR LINKED LIST ===\n\n");

    printf("--- Input Polynomial 1 (POLY1) ---\n");
    readPolynomial(POLY1);

    printf("\n--- Input Polynomial 2 (POLY2) ---\n");
    readPolynomial(POLY2);

    printf("\n----------------------------------------------------\n");
    printf("POLY1   : ");
    displayPolynomial(POLY1);

    printf("POLY2   : ");
    displayPolynomial(POLY2);

    POLYSUM = addPolynomials(POLY1, POLY2);

    printf("POLYSUM : ");
    displayPolynomial(POLYSUM);
    printf("----------------------------------------------------\n");

    freeList(POLY1);
    freeList(POLY2);
    freeList(POLYSUM);

    return 0;
}
`,
  },
  {
    id: 6,
    title: "Binary Tree Traversals",
    question:
      "Build a binary tree in level order from user input, then show preorder, inorder and postorder traversals.",
    filename: "program6-binary-tree-traversals.c",
    source: String.raw`#include <stdio.h>
#include <stdlib.h>

#define MAX_QUEUE 100

typedef struct TreeNode {
    int data;
    struct TreeNode *left;
    struct TreeNode *right;
} TreeNode;

TreeNode* createNode(int val) {
    TreeNode *newNode = (TreeNode *)malloc(sizeof(TreeNode));
    newNode->data = val;
    newNode->left = NULL;
    newNode->right = NULL;
    return newNode;
}

TreeNode* createTree() {
    int n, val;
    printf("Enter the number of nodes to insert: ");
    scanf("%d", &n);

    if (n <= 0) {
        printf("Invalid node count!\n");
        return NULL;
    }

    printf("Enter value for node 1 (Root): ");
    scanf("%d", &val);

    TreeNode *root = createNode(val);

    TreeNode *queue[MAX_QUEUE];
    int front = 0, rear = 0;
    queue[rear++] = root;

    int count = 1;
    while (front < rear && count < n) {
        TreeNode *curr = queue[front++];

        if (count < n) {
            printf("Enter left child of %d: ", curr->data);
            scanf("%d", &val);
            curr->left = createNode(val);
            queue[rear++] = curr->left;
            count++;
        }

        if (count < n) {
            printf("Enter right child of %d: ", curr->data);
            scanf("%d", &val);
            curr->right = createNode(val);
            queue[rear++] = curr->right;
            count++;
        }
    }

    printf("\nBinary Tree created successfully with %d nodes.\n", n);
    return root;
}

void preorder(TreeNode *root) {
    if (root != NULL) {
        printf("%d ", root->data);
        preorder(root->left);
        preorder(root->right);
    }
}

void inorder(TreeNode *root) {
    if (root != NULL) {
        inorder(root->left);
        printf("%d ", root->data);
        inorder(root->right);
    }
}

void postorder(TreeNode *root) {
    if (root != NULL) {
        postorder(root->left);
        postorder(root->right);
        printf("%d ", root->data);
    }
}

void freeTree(TreeNode *root) {
    if (root != NULL) {
        freeTree(root->left);
        freeTree(root->right);
        free(root);
    }
}

int main() {
    TreeNode *root = NULL;
    int choice;

    while (1) {
        printf("\n========= BINARY TREE MENU =========\n");
        printf("1. Create Binary Tree\n");
        printf("2. Display Preorder Traversal\n");
        printf("3. Display Inorder Traversal\n");
        printf("4. Display Postorder Traversal\n");
        printf("5. Exit\n");
        printf("Enter your choice (1-5): ");

        if (scanf("%d", &choice) != 1) {
            printf("Invalid input! Exiting program.\n");
            break;
        }

        switch (choice) {
            case 1:
                if (root != NULL) {
                    freeTree(root);
                    root = NULL;
                }
                root = createTree();
                break;

            case 2:
                if (root == NULL) {
                    printf("\nTree is empty! Please create a tree first.\n");
                } else {
                    printf("\nPreorder Traversal: ");
                    preorder(root);
                    printf("\n");
                }
                break;

            case 3:
                if (root == NULL) {
                    printf("\nTree is empty! Please create a tree first.\n");
                } else {
                    printf("\nInorder Traversal: ");
                    inorder(root);
                    printf("\n");
                }
                break;

            case 4:
                if (root == NULL) {
                    printf("\nTree is empty! Please create a tree first.\n");
                } else {
                    printf("\nPostorder Traversal: ");
                    postorder(root);
                    printf("\n");
                }
                break;

            case 5:
                if (root != NULL) {
                    freeTree(root);
                }
                printf("Exiting program. Goodbye!\n");
                return 0;

            default:
                printf("Invalid choice! Please choose between 1 and 5.\n");
        }
    }

    if (root != NULL) {
        freeTree(root);
    }
    return 0;
}
`,
  },
];

/** Lookup by the URL segment: /api/1 → program 1. */
export const C_PROGRAMS_BY_ID: Record<string, CProgram> = Object.fromEntries(
  C_PROGRAMS.map((program) => [String(program.id), program])
);

/**
 * Plain-text response: heading banner + full program source.
 * `curl /api/1` prints everything; `curl "/api/1?dl=1"` saves it as .c.
 */
export function cProgramResponse(program: CProgram, download = false): Response {
  const headers: Record<string, string> = {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control":
      "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    "X-Program-Id": String(program.id),
    "X-Program-Title": program.title,
  };
  if (download) {
    headers["Content-Disposition"] = `attachment; filename="${program.filename}"`;
  }
  return new Response(banner(program) + program.source, { status: 200, headers });
}
