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
    Book *books;
    int i;

    printf("Enter the number of books (N): ");
    scanf("%d", n);

    if (*n <= 0) {
        printf("Invalid count. Setting book count to 0.\n");
        *n = 0;
        return NULL;
    }

    books = (Book *)malloc((*n) * sizeof(Book));
    if (books == NULL) {
        printf("Memory allocation failed!\n");
        *n = 0;
        return NULL;
    }

    for (i = 0; i < *n; i++) {
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
    int i;

    if (books == NULL || n == 0) {
        printf("\nNo book records found! Please add books first.\n");
        return;
    }

    printf("\n%-10s %-25s %-20s %-10s %-15s\n", "Book ID", "Title", "Author", "Price", "Status");
    printf("--------------------------------------------------------------------------------\n");
    for (i = 0; i < n; i++) {
        printf("%-10d %-25s %-20s %-10.2f %-15s\n",
               books[i].book_id,
               books[i].title,
               books[i].author,
               books[i].price,
               books[i].availability_status);
    }
}

void search(Book *books, int n) {
    int id, found = 0;
    int i;

    if (books == NULL || n == 0) {
        printf("\nNo books available to search.\n");
        return;
    }

    printf("Enter Book ID to search: ");
    scanf("%d", &id);

    for (i = 0; i < n; i++) {
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
    int id, found = 0;
    int i;

    if (books == NULL || n == 0) {
        printf("\nNo books available to issue.\n");
        return;
    }

    printf("Enter Book ID to issue: ");
    scanf("%d", &id);

    for (i = 0; i < n; i++) {
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
    int id, found = 0;
    int i;

    if (books == NULL || n == 0) {
        printf("\nNo books to return.\n");
        return;
    }

    printf("Enter Book ID to return: ");
    scanf("%d", &id);

    for (i = 0; i < n; i++) {
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
    int i, j;
    printf("Enter number of rows and columns: ");
    scanf("%d %d", rows, cols);

    a[0].row = *rows;
    a[0].col = *cols;

    printf("Enter the matrix elements (%d x %d):\n", *rows, *cols);
    for (i = 0; i < *rows; i++) {
        for (j = 0; j < *cols; j++) {
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
    int i;

    if (a[0].val == 0) {
        printf("Matrix is completely zero.\n");
        return;
    }
    printf("\nRow\tCol\tValue\n");
    printf("---------------------\n");
    for (i = 0; i <= a[0].val; i++) {
        printf("%d\t%d\t%d\n", a[i].row, a[i].col, a[i].val);
    }
}

void transposeSparse(Term a[], Term b[]) {
    int k = 1;
    int col, i;
    b[0].row = a[0].col;
    b[0].col = a[0].row;
    b[0].val = a[0].val;

    if (a[0].val > 0) {
        for (col = 0; col < a[0].col; col++) {
            for (i = 1; i <= a[0].val; i++) {
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
    int i = 1, j = 1, k = 1;

    if (a[0].row != b[0].row || a[0].col != b[0].col) {
        return 0;
    }
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
    source: String.raw`#include<stdio.h>
#include<stdlib.h>
#define MAX 4
int s[MAX];
int top = -1;
void push(int item);
int pop();
void display();
void main()
{
    int choice, item;
    while (1)
    {
printf("\n\n\n\n-----------Menu----------- : ");
printf("\n=>1.Push an Element to Stack and Overflow demo ");
printf("\n=>2.Pop an Element from Stack and Underflow demo");
printf("\n=>3.Display ");
printf("\n=>4.Exit");
printf("\nEnter your choice: ");
scanf("%d", & choice);
switch (choice)
{
case 1:
    printf("\nEnter an element to be pushed: ");
    scanf("%d", & item);
    push(item);
    break;
case 2:
    item = pop();
    if (item != -1)
printf("\nElement popped is: %d", item);
    break;
case 3:
    display();
    break;
case 4:
    exit(1);
default:
    printf("\nPlease enter valid choice ");
    break;
}
    }
}
void push(int item)
{
    if (top == MAX - 1)
    {
printf("\n-----------Stack overflow-----------");
return;
 }
    top = top + 1;
    s[top] = item;
}
int pop()
{
    int item;
    if (top == -1)
    {
printf("\n-----------Stack underflow-----------");
return -1;
    }
    item = s[top];
    top = top - 1;
    return item;
}
void display()
{
    int i;
    if (top == -1)
    {
printf("\n-----------Stack is empty-----------");
return;
    }
    printf("\n Stack elements are:\n ");
    for (i = top; i >= 0; i--)
        printf("%d\n", s[i]);
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

#define MAX 5

int queue[MAX];
int front = -1, rear = -1;

/* Check whether queue is empty */
int isEmpty()
{
    return (front == -1 && rear == -1);
}

/* Check whether queue is full */
int isFull()
{
    return ((rear + 1) % MAX == front);
}

/* Add a print job */
void addJob(int job)
{
    if (isFull())
    {
        printf("Printer Queue Overflow!\n");
        return;
    }

    if (isEmpty())
        front = rear = 0;
    else
        rear = (rear + 1) % MAX;

    queue[rear] = job;

    printf("Print job %d added successfully.\n", job);
}

/* Process/delete a print job */
void processJob()
{
    if (isEmpty())
    {
        printf("Printer Queue Underflow!\n");
        return;
    }

    printf("Processing print job: %d\n", queue[front]);

    if (front == rear)
        front = rear = -1;
    else
        front = (front + 1) % MAX;
}

/* Display number of waiting jobs */
void displayCount()
{
    int count;

    if (isEmpty())
    {
        count = 0;
    }
    else if (rear >= front)
    {
        count = rear - front + 1;
    }
    else
    {
        count = MAX - front + rear + 1;
    }

    printf("Number of print jobs waiting: %d\n", count);
}

int main()
{
    int choice, job;

    do
    {
        printf("\n--- PRINTER QUEUE ---\n");
        printf("1. Add Print Job\n");
        printf("2. Process Print Job\n");
        printf("3. Display Number of Waiting Jobs\n");
        printf("4. Exit\n");

        printf("Enter your choice: ");
        scanf("%d", &choice);

        switch(choice)
        {
            case 1:
                printf("Enter print job number: ");
                scanf("%d", &job);
                addJob(job);
                break;

            case 2:
                processJob();
                break;

            case 3:
                displayCount();
                break;

            case 4:
                printf("Exiting...\n");
                break;

            default:
                printf("Invalid choice!\n");
        }

    } while(choice != 4);

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

struct Node
{
    int coeff, power;
    struct Node *next;
};

typedef struct Node NODE;

NODE *createHeader()
{
    NODE *head = malloc(sizeof(NODE));
    head->next = head;
    return head;
}

void insert(NODE *head, int c, int p)
{
    NODE *newNode = malloc(sizeof(NODE));
    NODE *temp = head;
    newNode->coeff = c;
    newNode->power = p;
    while (temp->next != head)
        temp = temp->next;
    temp->next = newNode;
    newNode->next = head;
}

void readPoly(NODE *head)
{
    int degree, c, i;
    printf("Enter degree: ");
    scanf("%d", &degree);
    for (i = degree; i >= 0; i--)
    {
        printf("Coefficient of x^%d: ", i);
        scanf("%d", &c);
        if (c != 0)
            insert(head, c, i);
    }
}

void display(NODE *head)
{
    NODE *p = head->next;
    if (p == head)
    {
        printf("0");
        return;
    }
    while (p != head)
    {
        if (p != head->next && p->coeff > 0)
            printf(" + ");
        if (p->power == 0)
            printf("%d", p->coeff);
        else if (p->power == 1)
            printf("%dx", p->coeff);
        else
            printf("%dx^%d", p->coeff, p->power);
        p = p->next;
    }
}

NODE *addPoly(NODE *a, NODE *b)
{
    NODE *p = a->next, *q = b->next;
    NODE *sum = createHeader();
    while (p != a && q != b)
    {
        if (p->power == q->power)
        {
            insert(sum, p->coeff + q->coeff, p->power);
            p = p->next;
            q = q->next;
        }
        else if (p->power > q->power)
        {
            insert(sum, p->coeff, p->power);
            p = p->next;
        }
        else
        {
            insert(sum, q->coeff, q->power);
            q = q->next;
        }
    }
    while (p != a)
    {
        insert(sum, p->coeff, p->power);
        p = p->next;
    }
    while (q != b)
    {
        insert(sum, q->coeff, q->power);
        q = q->next;
    }
    return sum;
}

int main()
{
    NODE *p1, *p2, *sum;
    p1 = createHeader();
    p2 = createHeader();
    printf("Enter POLY1\n");
    readPoly(p1);
    printf("Enter POLY2\n");
    readPoly(p2);
    printf("\nPOLY1 = ");
    display(p1);
    printf("\nPOLY2 = ");
    display(p2);
    sum = addPoly(p1, p2);
    printf("\nSUM = ");
    display(sum);
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
struct Node
{
    int data;
    struct Node *left, *right;
};

struct Node* createNode(int data)
{
    struct Node *newNode = malloc(sizeof(struct Node));

    newNode->data = data;
    newNode->left = newNode->right = NULL;

    return newNode;
}

// Create Binary Tree using Level Order
struct Node* createTree()
{
    struct Node *root, *q[100], *temp;
    int n, i, data, front = 0, rear = 0;

    printf("Enter number of nodes: ");
    scanf("%d", &n);

    if (n <= 0)
        return NULL;

    for (i = 0; i < n; i++)
    {
        printf("Enter data: ");
        scanf("%d", &data);

        temp = createNode(data);

        if (i == 0)
            root = temp;
        else
        {
            if (q[front]->left == NULL)
                q[front]->left = temp;
            else
            {
                q[front]->right = temp;
                front++;
            }
        }

        q[rear++] = temp;
    }

    return root;
}

// Preorder: Root Left Right
void preorder(struct Node *root)
{
    if (root != NULL)
    {
        printf("%d ", root->data);
        preorder(root->left);
        preorder(root->right);
    }
}

// Inorder: Left Root Right
void inorder(struct Node *root)
{
    if (root != NULL)
    {
        inorder(root->left);
        printf("%d ", root->data);
        inorder(root->right);
    }
}

// Postorder: Left Right Root
void postorder(struct Node *root)
{
    if (root != NULL)
    {
        postorder(root->left);
        postorder(root->right);
        printf("%d ", root->data);
    }
}

int main()
{
    struct Node *root = NULL;
    int ch;

    while (1)
    {
         printf("\n\n===== BINARY TREE MENU =====");
        printf("\n\n1.Create  2.Preorder");
        printf("\n3.Inorder  4.Postorder  5.Exit");
        printf("\nEnter choice: ");
        scanf("%d", &ch);

        switch (ch)
        {
            case 1:
                root = createTree();
                break;

            case 2:
                preorder(root);
                break;

            case 3:
                inorder(root);
                break;

            case 4:
                postorder(root);
                break;

            case 5:
                exit(0);

            default:
                printf("Invalid choice");
        }
    }
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
