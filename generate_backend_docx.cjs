const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  PageBreak
} = require('docx');

const ROOT_DIR = 'C:\\Users\\sanch\\MICROPROJECT';
const OUTPUT_FILE = path.join(ROOT_DIR, 'BACKEND_CODEBASE.docx');

// ─── Define backend file categories ────────────────────────────────────────────
const fileCategories = [
  {
    category: '1. Server Entry Point & Configuration',
    description:
      'Express application bootstrap, middleware registration, route mounting, and environment configuration.',
    files: [
      {
        path: 'server/index.js',
        desc: 'Main Express server entry point — middleware setup, CORS, API route mounting, health check, and static file serving in production.'
      },
      {
        path: 'server/.env',
        desc: 'Environment variables for port, Node environment, MongoDB connection URI, and allowed client origin URL.'
      },
      {
        path: 'server/.env.example',
        desc: 'Template environment file documenting all required and optional configuration variables.'
      }
    ]
  },
  {
    category: '2. Database & Persistence Layer',
    description:
      'Local JSON file-based data store providing zero-configuration persistence with full CRUD operations and computed dashboard analytics.',
    files: [
      {
        path: 'server/db/localStore.js',
        desc: 'LocalStore class — JSON file-backed database with automatic persistence, transaction/budget/goal/recommendation/insight/user CRUD methods, filtering, sorting, auto-budget-update on expense creation, and live-computed dashboard summary (KPIs, health score, velocity).'
      }
    ]
  },
  {
    category: '3. Seed Data & Initial Records',
    description:
      'Default financial datasets used for bootstrapping the database on first run — includes sample user, transactions, budgets, goals, recommendations, and behavioral insights.',
    files: [
      {
        path: 'server/data/seedData.js',
        desc: 'Seed data module exporting initialUser, initialTransactions, initialBudgets, initialGoals, initialRecommendations, and initialInsights arrays.'
      }
    ]
  },
  {
    category: '4. Mongoose Schema Models (MongoDB-Ready)',
    description:
      'Mongoose schema definitions prepared for production MongoDB migration. Currently available as reference models; the active data layer uses LocalStore.',
    files: [
      {
        path: 'server/models/User.js',
        desc: 'User schema — name, email, avatar, and nested preferences (currency, theme, notification toggles) with timestamps.'
      },
      {
        path: 'server/models/Transaction.js',
        desc: 'Transaction schema — description, amount, category, date, type (income/expense), note, userId foreign key, with indexed fields.'
      },
      {
        path: 'server/models/Budget.js',
        desc: 'Budget schema — category spending cap with limit and spent tracking per user.'
      },
      {
        path: 'server/models/Goal.js',
        desc: 'Goal schema — savings target with title, targetAmount, savedAmount, targetDate, icon, and color theme.'
      },
      {
        path: 'server/models/Recommendation.js',
        desc: 'Recommendation schema — financial optimization suggestion with estimated saving, difficulty level, dismissed/completed state.'
      },
      {
        path: 'server/models/Insight.js',
        desc: 'Insight schema — behavioral spending pattern observation with type classification (positive, warning, info).'
      }
    ]
  },
  {
    category: '5. RESTful API Route Handlers',
    description:
      'Express Router modules implementing the full REST API surface — each route file handles its domain-specific HTTP verbs with input validation and error handling.',
    files: [
      {
        path: 'server/routes/dashboard.js',
        desc: 'GET /api/dashboard — Returns live-computed financial summary KPIs (totalSpending, totalIncome, currentBalance, savingsRate, spendingVelocity, spendingHealthScore).'
      },
      {
        path: 'server/routes/transactions.js',
        desc: 'Full CRUD for transactions — GET with query filtering (type, category, search), POST with validation, PUT for updates, DELETE with 404 handling.'
      },
      {
        path: 'server/routes/budgets.js',
        desc: 'Full CRUD for category budgets — GET all, POST with validation (category + positive limit), PUT for updates, DELETE with 404 handling.'
      },
      {
        path: 'server/routes/goals.js',
        desc: 'CRUD + contribute for savings goals — GET all, POST with validation, PUT /:id/contribute to add funds, DELETE with 404 handling.'
      },
      {
        path: 'server/routes/insights.js',
        desc: 'GET /api/insights — Read-only endpoint returning behavioral spending pattern observations.'
      },
      {
        path: 'server/routes/recommendations.js',
        desc: 'GET /api/recommendations + PUT /:id — Fetch smart savings suggestions and update their dismissed/completed status.'
      },
      {
        path: 'server/routes/user.js',
        desc: 'GET /api/user + PUT /api/user — Fetch and update user profile details and preference settings.'
      }
    ]
  }
];

// ─── Style Constants ───────────────────────────────────────────────────────────
const COLORS = {
  primary: '1B4F72',
  secondary: '2E86C1',
  accent: '17A589',
  dark: '2C3E50',
  medium: '566573',
  light: '85929E',
  codeBg: 'F8F9FA',
  headerBg: '1B4F72',
  headerText: 'FFFFFF',
  border: 'D5D8DC',
  tableHeader: '2E86C1',
  tableAlt: 'EBF5FB'
};

const FONT = {
  heading: 'Segoe UI',
  body: 'Segoe UI',
  code: 'Consolas'
};

// ─── Helper: Read a file safely ────────────────────────────────────────────────
function readFileContent(relPath) {
  const fullPath = path.join(ROOT_DIR, relPath);
  try {
    return fs.readFileSync(fullPath, 'utf-8');
  } catch (err) {
    return `// ERROR: Could not read file: ${err.message}`;
  }
}

// ─── Helper: Detect language from file extension ───────────────────────────────
function getLanguage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.js': 'JavaScript (ES Modules)',
    '.ts': 'TypeScript',
    '.json': 'JSON',
    '.env': 'Environment Variables',
    '.example': 'Environment Template'
  };
  return map[ext] || 'Plain Text';
}

// ─── Helper: Create a styled table ─────────────────────────────────────────────
function createStyledTable(headers, rows) {
  const borderStyle = {
    style: BorderStyle.SINGLE,
    size: 1,
    color: COLORS.border
  };
  const borders = {
    top: borderStyle,
    bottom: borderStyle,
    left: borderStyle,
    right: borderStyle
  };

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(
      (h) =>
        new TableCell({
          borders,
          shading: { fill: COLORS.tableHeader },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: h,
                  bold: true,
                  color: COLORS.headerText,
                  font: FONT.body,
                  size: 20
                })
              ]
            })
          ]
        })
    )
  });

  const dataRows = rows.map(
    (row, idx) =>
      new TableRow({
        children: row.map(
          (cell) =>
            new TableCell({
              borders,
              shading: idx % 2 === 1 ? { fill: COLORS.tableAlt } : undefined,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: cell,
                      font: FONT.body,
                      size: 20,
                      color: COLORS.dark
                    })
                  ]
                })
              ]
            })
        )
      })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows]
  });
}

// ─── Build Code Block Paragraphs ───────────────────────────────────────────────
function buildCodeBlock(content) {
  const lines = content.split('\n');
  const paragraphs = [];

  lines.forEach((line, idx) => {
    const lineNumStr = String(idx + 1).padStart(4, ' ') + '  ';
    paragraphs.push(
      new Paragraph({
        spacing: { before: 0, after: 0, line: 276 },
        shading: { fill: COLORS.codeBg },
        children: [
          new TextRun({
            text: lineNumStr,
            font: FONT.code,
            size: 17,
            color: COLORS.light
          }),
          new TextRun({
            text: line || ' ',
            font: FONT.code,
            size: 17,
            color: COLORS.dark
          })
        ]
      })
    );
  });

  return paragraphs;
}

// ─── Horizontal Rule ───────────────────────────────────────────────────────────
function horizontalRule() {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 2, color: COLORS.border }
    },
    children: [new TextRun({ text: '' })]
  });
}

// ─── Build the Document ────────────────────────────────────────────────────────
async function generate() {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║   📦 SmartSpend BACKEND Codebase DOCX Generator     ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  const sections = [];

  // ─── COVER PAGE ────────────────────────────────────────────────────────────
  sections.push(
    // Title
    new Paragraph({
      spacing: { before: 3000, after: 200 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'SMARTSPEND',
          bold: true,
          font: FONT.heading,
          size: 56,
          color: COLORS.primary
        })
      ]
    }),
    new Paragraph({
      spacing: { before: 100, after: 100 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'Personal Finance Management System',
          font: FONT.heading,
          size: 32,
          color: COLORS.secondary
        })
      ]
    }),
    horizontalRule(),
    new Paragraph({
      spacing: { before: 400, after: 200 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'BACKEND CODEBASE DOCUMENTATION',
          bold: true,
          font: FONT.heading,
          size: 40,
          color: COLORS.accent
        })
      ]
    }),
    new Paragraph({
      spacing: { before: 200, after: 100 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'Node.js · Express 5 · LocalStore (JSON DB) · Mongoose Models',
          font: FONT.body,
          size: 22,
          color: COLORS.medium
        })
      ]
    }),
    horizontalRule(),
    new Paragraph({
      spacing: { before: 600, after: 100 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'Complete Backend Source Code Reference',
          font: FONT.body,
          size: 24,
          color: COLORS.medium,
          italics: true
        })
      ]
    }),
    new Paragraph({
      spacing: { before: 100, after: 100 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Generated: ${new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}`,
          font: FONT.body,
          size: 20,
          color: COLORS.light
        })
      ]
    }),
    new Paragraph({
      children: [new PageBreak()]
    })
  );

  // ─── TABLE OF CONTENTS ─────────────────────────────────────────────────────
  sections.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 300 },
      children: [
        new TextRun({
          text: 'TABLE OF CONTENTS',
          bold: true,
          font: FONT.heading,
          size: 32,
          color: COLORS.primary
        })
      ]
    }),
    horizontalRule()
  );

  // Add TOC entries
  let fileCounter = 0;
  fileCategories.forEach((cat) => {
    sections.push(
      new Paragraph({
        spacing: { before: 200, after: 60 },
        children: [
          new TextRun({
            text: `■  ${cat.category}`,
            bold: true,
            font: FONT.body,
            size: 22,
            color: COLORS.secondary
          })
        ]
      })
    );
    cat.files.forEach((f) => {
      fileCounter++;
      sections.push(
        new Paragraph({
          spacing: { before: 40, after: 40 },
          indent: { left: 600 },
          children: [
            new TextRun({
              text: `${fileCounter}.  `,
              font: FONT.body,
              size: 20,
              color: COLORS.light
            }),
            new TextRun({
              text: f.path,
              font: FONT.code,
              size: 20,
              color: COLORS.dark
            })
          ]
        })
      );
    });
  });

  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // ─── ARCHITECTURE OVERVIEW ─────────────────────────────────────────────────
  sections.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({
          text: 'BACKEND ARCHITECTURE OVERVIEW',
          bold: true,
          font: FONT.heading,
          size: 32,
          color: COLORS.primary
        })
      ]
    }),
    horizontalRule(),
    new Paragraph({
      spacing: { before: 200, after: 200 },
      children: [
        new TextRun({
          text: 'The SmartSpend backend follows a layered Express.js architecture with clean separation of concerns:',
          font: FONT.body,
          size: 22,
          color: COLORS.dark
        })
      ]
    })
  );

  // Architecture table
  sections.push(
    createStyledTable(
      ['Layer', 'Component', 'Responsibility'],
      [
        [
          'Entry Point',
          'server/index.js',
          'Express app initialization, middleware registration (CORS, JSON parsing, request logging), API route mounting, health check endpoint, and production static file serving.'
        ],
        [
          'Route Handlers',
          'server/routes/*.js',
          'Domain-specific Express Router modules handling HTTP verbs (GET, POST, PUT, DELETE) with input validation, error handling, and response formatting.'
        ],
        [
          'Data Access Layer',
          'server/db/localStore.js',
          'LocalStore class providing zero-config JSON file persistence with full CRUD operations, query filtering, sorting, auto-computed dashboard KPIs, and budget auto-update on expense creation.'
        ],
        [
          'Schema Models',
          'server/models/*.js',
          'Mongoose schema definitions ready for MongoDB migration — currently serve as reference data contracts with field validations, indexes, and enum constraints.'
        ],
        [
          'Seed Data',
          'server/data/seedData.js',
          'Initial dataset exports for bootstrapping the database on first launch with sample user, transactions, budgets, goals, recommendations, and insights.'
        ],
        [
          'Configuration',
          'server/.env',
          'Environment variables: PORT, NODE_ENV, MONGODB_URI, CLIENT_URL.'
        ]
      ]
    )
  );

  sections.push(
    new Paragraph({ spacing: { before: 200, after: 200 }, children: [] })
  );

  // API Endpoints summary table
  sections.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({
          text: 'RESTful API Endpoint Summary',
          bold: true,
          font: FONT.heading,
          size: 26,
          color: COLORS.secondary
        })
      ]
    }),
    createStyledTable(
      ['Method', 'Endpoint', 'Description'],
      [
        ['GET', '/api/health', 'Server health check with uptime and timestamp'],
        ['GET', '/api/dashboard', 'Computed financial summary KPIs'],
        ['GET', '/api/transactions', 'List transactions (filterable by type, category, search)'],
        ['POST', '/api/transactions', 'Create a new income or expense transaction'],
        ['PUT', '/api/transactions/:id', 'Update an existing transaction'],
        ['DELETE', '/api/transactions/:id', 'Delete a transaction'],
        ['GET', '/api/budgets', 'List all category budgets'],
        ['POST', '/api/budgets', 'Create a new category budget'],
        ['PUT', '/api/budgets/:id', 'Update a budget limit'],
        ['DELETE', '/api/budgets/:id', 'Delete a budget'],
        ['GET', '/api/goals', 'List all savings goals'],
        ['POST', '/api/goals', 'Create a new savings goal'],
        ['PUT', '/api/goals/:id/contribute', 'Contribute funds to a goal'],
        ['DELETE', '/api/goals/:id', 'Delete a goal'],
        ['GET', '/api/insights', 'Fetch behavioral spending insights'],
        ['GET', '/api/recommendations', 'Fetch smart savings recommendations'],
        ['PUT', '/api/recommendations/:id', 'Update recommendation status (dismiss/complete)'],
        ['GET', '/api/user', 'Get user profile and preferences'],
        ['PUT', '/api/user', 'Update user profile and preferences']
      ]
    )
  );

  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // ─── TECHNOLOGY STACK ──────────────────────────────────────────────────────
  sections.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({
          text: 'BACKEND TECHNOLOGY STACK',
          bold: true,
          font: FONT.heading,
          size: 32,
          color: COLORS.primary
        })
      ]
    }),
    horizontalRule(),
    createStyledTable(
      ['Technology', 'Version', 'Role', 'Justification'],
      [
        [
          'Node.js',
          'v18+ LTS',
          'Runtime Engine',
          'Event-driven, non-blocking I/O model ideal for RESTful APIs; native ES Module support.'
        ],
        [
          'Express',
          '5.3.0',
          'Web Framework',
          'Minimal, unopinionated framework for building RESTful API routes with middleware composition.'
        ],
        [
          'Mongoose',
          '9.11.2',
          'ODM (MongoDB)',
          'Schema-based modeling for MongoDB with built-in validation, type casting, and query building.'
        ],
        [
          'CORS',
          '2.8.6',
          'Cross-Origin Middleware',
          'Enables secure cross-origin requests between the Vite dev server (port 5173) and Express API (port 5000).'
        ],
        [
          'dotenv',
          '18.0.7',
          'Env Configuration',
          'Loads environment variables from .env file into process.env for zero-hardcoded secrets.'
        ],
        [
          'LocalStore (Custom)',
          'Built-in',
          'JSON File Database',
          'Zero-dependency, zero-configuration persistent data store using fs read/write — eliminates MongoDB dependency for development and demo environments.'
        ]
      ]
    ),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ─── FILE-BY-FILE SOURCE CODE ──────────────────────────────────────────────
  sections.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({
          text: 'COMPLETE BACKEND SOURCE CODE',
          bold: true,
          font: FONT.heading,
          size: 32,
          color: COLORS.primary
        })
      ]
    }),
    horizontalRule()
  );

  let globalFileNum = 0;

  for (const cat of fileCategories) {
    // Category heading
    sections.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 100 },
        children: [
          new TextRun({
            text: cat.category,
            bold: true,
            font: FONT.heading,
            size: 28,
            color: COLORS.secondary
          })
        ]
      }),
      new Paragraph({
        spacing: { before: 60, after: 200 },
        children: [
          new TextRun({
            text: cat.description,
            font: FONT.body,
            size: 20,
            color: COLORS.medium,
            italics: true
          })
        ]
      })
    );

    for (const file of cat.files) {
      globalFileNum++;
      const content = readFileContent(file.path);
      const lang = getLanguage(file.path);
      const lineCount = content.split('\n').length;
      const byteSize = Buffer.byteLength(content, 'utf-8');

      // File header
      sections.push(
        horizontalRule(),
        new Paragraph({
          spacing: { before: 300, after: 100 },
          children: [
            new TextRun({
              text: `FILE ${globalFileNum}:  `,
              bold: true,
              font: FONT.body,
              size: 22,
              color: COLORS.accent
            }),
            new TextRun({
              text: file.path,
              bold: true,
              font: FONT.code,
              size: 22,
              color: COLORS.primary
            })
          ]
        }),
        // Description
        new Paragraph({
          spacing: { before: 60, after: 60 },
          children: [
            new TextRun({
              text: 'Purpose:  ',
              bold: true,
              font: FONT.body,
              size: 20,
              color: COLORS.dark
            }),
            new TextRun({
              text: file.desc,
              font: FONT.body,
              size: 20,
              color: COLORS.medium,
              italics: true
            })
          ]
        }),
        // Metadata
        new Paragraph({
          spacing: { before: 40, after: 100 },
          children: [
            new TextRun({
              text: `Language: ${lang}   |   Lines: ${lineCount}   |   Size: ${(
                byteSize / 1024
              ).toFixed(2)} KB`,
              font: FONT.body,
              size: 18,
              color: COLORS.light
            })
          ]
        }),
        // Code content
        ...buildCodeBlock(content)
      );

      console.log(
        `  ✅ [${globalFileNum}] ${file.path}  (${lineCount} lines, ${(
          byteSize / 1024
        ).toFixed(1)} KB)`
      );
    }

    // Page break after each category
    sections.push(new Paragraph({ children: [new PageBreak()] }));
  }

  // ─── DIRECTORY STRUCTURE ───────────────────────────────────────────────────
  sections.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({
          text: 'BACKEND DIRECTORY STRUCTURE',
          bold: true,
          font: FONT.heading,
          size: 32,
          color: COLORS.primary
        })
      ]
    }),
    horizontalRule()
  );

  const treeLines = [
    'server/',
    '├── .env                        # Environment configuration',
    '├── .env.example                # Env template with documentation',
    '├── index.js                    # Express app entry point',
    '├── data/',
    '│   ├── seedData.js             # Initial seed datasets',
    '│   └── database.json           # Auto-generated persistent store',
    '├── db/',
    '│   └── localStore.js           # JSON file-based database layer',
    '├── models/',
    '│   ├── User.js                 # Mongoose User schema',
    '│   ├── Transaction.js          # Mongoose Transaction schema',
    '│   ├── Budget.js               # Mongoose Budget schema',
    '│   ├── Goal.js                 # Mongoose Goal schema',
    '│   ├── Recommendation.js       # Mongoose Recommendation schema',
    '│   └── Insight.js              # Mongoose Insight schema',
    '└── routes/',
    '    ├── dashboard.js            # GET /api/dashboard',
    '    ├── transactions.js         # CRUD /api/transactions',
    '    ├── budgets.js              # CRUD /api/budgets',
    '    ├── goals.js                # CRUD + contribute /api/goals',
    '    ├── insights.js             # GET /api/insights',
    '    ├── recommendations.js      # GET + PUT /api/recommendations',
    '    └── user.js                 # GET + PUT /api/user'
  ];

  treeLines.forEach((line) => {
    sections.push(
      new Paragraph({
        spacing: { before: 0, after: 0, line: 300 },
        children: [
          new TextRun({
            text: line,
            font: FONT.code,
            size: 19,
            color: COLORS.dark
          })
        ]
      })
    );
  });

  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // ─── SUMMARY & STATISTICS ─────────────────────────────────────────────────
  sections.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({
          text: 'CODEBASE STATISTICS',
          bold: true,
          font: FONT.heading,
          size: 32,
          color: COLORS.primary
        })
      ]
    }),
    horizontalRule()
  );

  // Compute stats
  let totalLines = 0;
  let totalBytes = 0;
  let totalFiles = 0;

  fileCategories.forEach((cat) => {
    cat.files.forEach((file) => {
      const content = readFileContent(file.path);
      totalLines += content.split('\n').length;
      totalBytes += Buffer.byteLength(content, 'utf-8');
      totalFiles++;
    });
  });

  sections.push(
    createStyledTable(
      ['Metric', 'Value'],
      [
        ['Total Backend Files', String(totalFiles)],
        ['Total Lines of Code', String(totalLines)],
        [
          'Total Codebase Size',
          `${(totalBytes / 1024).toFixed(2)} KB`
        ],
        ['API Endpoints', '19 (7 route modules)'],
        ['Mongoose Models', '6 (User, Transaction, Budget, Goal, Recommendation, Insight)'],
        ['Data Store', 'LocalStore (JSON file-based, zero-config)'],
        ['Runtime', 'Node.js v18+ with ES Modules'],
        ['Framework', 'Express 5.3.0'],
        [
          'Document Generated',
          new Date().toLocaleString('en-IN', {
            dateStyle: 'full',
            timeStyle: 'short'
          })
        ]
      ]
    )
  );

  // ─── ASSEMBLE DOCUMENT ─────────────────────────────────────────────────────
  const doc = new Document({
    creator: 'SmartSpend Development Team',
    title: 'SmartSpend Backend Codebase Documentation',
    description:
      'Complete backend source code documentation for the SmartSpend personal finance management system.',
    sections: [
      {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'SmartSpend — Backend Codebase',
                    font: FONT.body,
                    size: 16,
                    color: COLORS.light,
                    italics: true
                  })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Page ',
                    font: FONT.body,
                    size: 16,
                    color: COLORS.light
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: FONT.body,
                    size: 16,
                    color: COLORS.light
                  }),
                  new TextRun({
                    text: '  |  SmartSpend Backend Documentation  |  Confidential',
                    font: FONT.body,
                    size: 16,
                    color: COLORS.light
                  })
                ]
              })
            ]
          })
        },
        children: sections
      }
    ]
  });

  // ─── WRITE TO DISK ─────────────────────────────────────────────────────────
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUTPUT_FILE, buffer);

  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log(`║   ✅ BACKEND_CODEBASE.docx generated successfully!   ║`);
  console.log(`║   📄 ${OUTPUT_FILE}`);
  console.log(`║   📊 ${totalFiles} files  |  ${totalLines} lines  |  ${(totalBytes / 1024).toFixed(1)} KB`);
  console.log('╚═══════════════════════════════════════════════════════╝\n');
}

generate().catch((err) => {
  console.error('❌ Generation failed:', err);
  process.exit(1);
});
