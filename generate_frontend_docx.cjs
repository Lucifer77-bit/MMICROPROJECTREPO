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
const OUTPUT_FILE = path.join(ROOT_DIR, 'FRONTEND_CODEBASE.docx');

// Define the complete list of frontend files in organized categories
const fileCategories = [
  {
    category: '1. Project Entry & Build Configuration',
    description: 'HTML root template, build tool configurations, and project dependency manifests.',
    files: [
      {
        path: 'index.html',
        desc: 'Main HTML5 entry point and single-page application mount container.'
      },
      {
        path: 'vite.config.ts',
        desc: 'Vite build tooling configuration, React plugin setup, and dev server options.'
      },
      {
        path: 'package.json',
        desc: 'Frontend package dependencies, scripts, and runtime packages.'
      }
    ]
  },
  {
    category: '2. Application Bootstrap & Routing',
    description: 'React DOM rendering root, master routing provider, theme and layout controllers.',
    files: [
      {
        path: 'src/main.tsx',
        desc: 'React 18 root mounting and StrictMode initialization.'
      },
      {
        path: 'src/App.tsx',
        desc: 'Root component with routing, active page state, and currency context provider.'
      },
      {
        path: 'src/layouts/MainLayout.tsx',
        desc: 'Main shell layout containing the responsive sidebar, topbar, and main viewport.'
      }
    ]
  },
  {
    category: '3. Stylesheets & Design System',
    description: 'CSS variables, layout structures, micro-animations, theme styles, and responsive classes.',
    files: [
      {
        path: 'src/App.css',
        desc: 'Complete application styles, glassmorphic card design, badges, and animations.'
      },
      {
        path: 'src/index.css',
        desc: 'Global CSS reset, font imports, and root CSS variable definitions.'
      }
    ]
  },
  {
    category: '4. Data Types & TypeScript Contracts',
    description: 'Strongly-typed data structures for financial metrics, transactions, budgets, goals, and insights.',
    files: [
      {
        path: 'src/types/index.ts',
        desc: 'TypeScript interfaces and data models shared across components and services.'
      }
    ]
  },
  {
    category: '5. Services & Fallback Fixtures',
    description: 'Axios HTTP client for REST API endpoints and mock data fallbacks for standalone/offline mode.',
    files: [
      {
        path: 'src/services/api.ts',
        desc: 'Axios API service methods for transactions, budgets, goals, insights, and recommendations.'
      },
      {
        path: 'src/data/mockData.ts',
        desc: 'Rich seed mock data used when backend is offline or during demo mode.'
      }
    ]
  },
  {
    category: '6. UI Navigation & Common Components',
    description: 'Persistent navigation sidebar with badges and top navigation bar with quick controls.',
    files: [
      {
        path: 'src/components/Sidebar.tsx',
        desc: 'Collapsible sidebar navigation with active route highlights, badges, and brand identity.'
      },
      {
        path: 'src/components/Topbar.tsx',
        desc: 'Header bar with search input, currency switcher, notifications popup, and user profile.'
      }
    ]
  },
  {
    category: '7. Application Views & Pages',
    description: 'Interactive views providing analytics, transaction tracking, budget managers, and AI insights.',
    files: [
      {
        path: 'src/pages/LandingPage.tsx',
        desc: 'Hero landing page showcasing platform value propositions, features, and CTA buttons.'
      },
      {
        path: 'src/pages/DashboardPage.tsx',
        desc: 'Central dashboard overview with KPI metric cards, income/expense charts, and recent activity.'
      },
      {
        path: 'src/pages/TransactionsPage.tsx',
        desc: 'Transaction log with search, multi-category filters, sorting, modal creation, and CSV export.'
      },
      {
        path: 'src/pages/BudgetsPage.tsx',
        desc: 'Budget tracker with category spending vs limits, visual progress bars, and alert status.'
      },
      {
        path: 'src/pages/GoalsPage.tsx',
        desc: 'Financial savings goals manager with progress milestones, target dates, and deposit tracking.'
      },
      {
        path: 'src/pages/InsightsPage.tsx',
        desc: 'Deep spending analytics, weekly spending trends, category breakdown, and AI smart insights.'
      },
      {
        path: 'src/pages/RecommendationsPage.tsx',
        desc: 'AI-driven financial recommendations, potential monthly savings, and actionable advice cards.'
      },
      {
        path: 'src/pages/SettingsPage.tsx',
        desc: 'Configuration view for currency preferences, monthly budget limit, notifications, and profile.'
      }
    ]
  },
  {
    category: '8. Utility Functions & Custom Hooks',
    description: 'Reusable currency formatters, date transformers, currency state hooks, and CSV exporter.',
    files: [
      {
        path: 'src/utils/format.ts',
        desc: 'Formatting utilities for currency conversion, date representation, and percentages.'
      },
      {
        path: 'src/utils/useCurrency.ts',
        desc: 'Custom React hook for global currency selection (USD, EUR, GBP, INR, etc.).'
      },
      {
        path: 'src/utils/exportCsv.ts',
        desc: 'Browser-side CSV file generator and download trigger for transaction records.'
      }
    ]
  }
];

// Helper to format line numbers: "001 | "
function padLineNumber(num, totalDigits = 3) {
  const str = String(num);
  return str.padStart(totalDigits, '0');
}

async function generateDocx() {
  console.log('Reading files and calculating stats...');
  const allFilesData = [];
  let totalLines = 0;
  let totalBytes = 0;

  for (const cat of fileCategories) {
    for (const f of cat.files) {
      const fullPath = path.join(ROOT_DIR, f.path);
      let content = '';
      try {
        content = fs.readFileSync(fullPath, 'utf8');
      } catch (err) {
        console.warn(`Warning: Could not read ${fullPath}`, err.message);
        content = `// Error reading file: ${err.message}`;
      }

      const lines = content.split(/\r?\n/);
      totalLines += lines.length;
      totalBytes += Buffer.byteLength(content, 'utf8');

      allFilesData.push({
        category: cat.category,
        relPath: f.path,
        desc: f.desc,
        lines: lines,
        lineCount: lines.length,
        sizeKb: (Buffer.byteLength(content, 'utf8') / 1024).toFixed(1)
      });
    }
  }

  console.log(`Total files: ${allFilesData.length}, Total lines: ${totalLines}, Total size: ${(totalBytes / 1024).toFixed(1)} KB`);

  // Document styles and elements
  const children = [];

  // ==================== COVER / HEADER ====================
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 360, after: 120 },
      children: [
        new TextRun({
          text: 'PERSONAL FINANCE & ANALYTICS PLATFORM',
          font: 'Segoe UI',
          size: 32, // 16pt
          bold: true,
          color: '2563EB'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 360 },
      children: [
        new TextRun({
          text: 'Complete Frontend Source Code Documentation',
          font: 'Segoe UI',
          size: 44, // 22pt
          bold: true,
          color: '0F172A'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 480 },
      children: [
        new TextRun({
          text: 'Microproject Comprehensive Code Export | React 18 • TypeScript • Vite • CSS3',
          font: 'Segoe UI',
          size: 22,
          color: '64748B',
          italics: true
        })
      ]
    })
  );

  // Metadata summary table
  const metaRows = [
    ['Document Type', 'Frontend Source Code Compilation (.docx)'],
    ['Application Name', 'FinTrack - Personal Finance Management & Smart Analytics'],
    ['Frontend Framework', 'React 18 with TypeScript & Vite'],
    ['Architecture', 'Modular Single-Page Application (SPA) with Component-driven UI'],
    ['Total Frontend Files', `${allFilesData.length} files`],
    ['Total Source Lines', `${totalLines.toLocaleString()} Lines of Code (LOC)`],
    ['Total Frontend Code Size', `${(totalBytes / 1024).toFixed(1)} KB`],
    ['Generated On', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
    ['Target Platform', 'Modern Web Browsers (Chrome, Edge, Firefox, Safari)']
  ];

  const metaTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: metaRows.map(([label, val], idx) => {
      const isAlt = idx % 2 === 1;
      return new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: { fill: isAlt ? 'F8FAFC' : 'F1F5F9' },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' },
              bottom: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' },
              left: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' },
              right: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' }
            },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: label,
                    font: 'Segoe UI',
                    size: 20,
                    bold: true,
                    color: '1E293B'
                  })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            shading: { fill: isAlt ? 'FFFFFF' : 'FAFAFA' },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' },
              bottom: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' },
              left: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' },
              right: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' }
            },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: val,
                    font: 'Segoe UI',
                    size: 20,
                    color: '334155'
                  })
                ]
              })
            ]
          })
        ]
      });
    })
  });

  children.push(metaTable);

  children.push(
    new Paragraph({
      spacing: { before: 360, after: 120 },
      children: [
        new TextRun({
          text: 'Document Overview & Architecture Note:',
          font: 'Segoe UI',
          size: 22,
          bold: true,
          color: '0F172A'
        })
      ]
    }),
    new Paragraph({
      spacing: { before: 0, after: 240 },
      children: [
        new TextRun({
          text: 'This document contains the verified, complete frontend codebase of the Personal Finance Management & Analytics application. The project is organized cleanly into modular architectural tiers: HTML/Vite build configurations, React root routers, design stylesheets, TypeScript interfaces, REST API and mock data services, navigation components, interactive application pages (Dashboard, Transactions, Budgets, Goals, Insights, Recommendations, Settings), and utility hooks.',
          font: 'Segoe UI',
          size: 20,
          color: '475569'
        })
      ]
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ==================== TABLE OF CONTENTS TABLE ====================
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 120, after: 200 },
      children: [
        new TextRun({
          text: 'Table of Frontend Files & Modules',
          font: 'Segoe UI',
          size: 28,
          bold: true,
          color: '1E3A8A'
        })
      ]
    })
  );

  const tocHeaderRow = new TableRow({
    children: [
      new TableCell({
        width: { size: 6, type: WidthType.PERCENTAGE },
        shading: { fill: '2563EB' },
        margins: { top: 100, bottom: 100, left: 100, right: 100 },
        children: [new Paragraph({ children: [new TextRun({ text: '#', font: 'Segoe UI', size: 19, bold: true, color: 'FFFFFF' })] })]
      }),
      new TableCell({
        width: { size: 34, type: WidthType.PERCENTAGE },
        shading: { fill: '2563EB' },
        margins: { top: 100, bottom: 100, left: 100, right: 100 },
        children: [new Paragraph({ children: [new TextRun({ text: 'File Path', font: 'Segoe UI', size: 19, bold: true, color: 'FFFFFF' })] })]
      }),
      new TableCell({
        width: { size: 44, type: WidthType.PERCENTAGE },
        shading: { fill: '2563EB' },
        margins: { top: 100, bottom: 100, left: 100, right: 100 },
        children: [new Paragraph({ children: [new TextRun({ text: 'Functional Role', font: 'Segoe UI', size: 19, bold: true, color: 'FFFFFF' })] })]
      }),
      new TableCell({
        width: { size: 8, type: WidthType.PERCENTAGE },
        shading: { fill: '2563EB' },
        alignment: AlignmentType.RIGHT,
        margins: { top: 100, bottom: 100, left: 100, right: 100 },
        children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Lines', font: 'Segoe UI', size: 19, bold: true, color: 'FFFFFF' })] })]
      }),
      new TableCell({
        width: { size: 8, type: WidthType.PERCENTAGE },
        shading: { fill: '2563EB' },
        alignment: AlignmentType.RIGHT,
        margins: { top: 100, bottom: 100, left: 100, right: 100 },
        children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Size', font: 'Segoe UI', size: 19, bold: true, color: 'FFFFFF' })] })]
      })
    ]
  });

  const tocRows = [tocHeaderRow];
  allFilesData.forEach((f, idx) => {
    const isAlt = idx % 2 === 1;
    tocRows.push(
      new TableRow({
        children: [
          new TableCell({
            width: { size: 6, type: WidthType.PERCENTAGE },
            shading: { fill: isAlt ? 'F8FAFC' : 'FFFFFF' },
            borders: {
              bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
              top: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
              left: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
              right: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' }
            },
            margins: { top: 60, bottom: 60, left: 80, right: 80 },
            children: [new Paragraph({ children: [new TextRun({ text: String(idx + 1), font: 'Segoe UI', size: 18, color: '64748B' })] })]
          }),
          new TableCell({
            width: { size: 34, type: WidthType.PERCENTAGE },
            shading: { fill: isAlt ? 'F8FAFC' : 'FFFFFF' },
            borders: {
              bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
              top: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
              left: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
              right: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' }
            },
            margins: { top: 60, bottom: 60, left: 80, right: 80 },
            children: [new Paragraph({ children: [new TextRun({ text: f.relPath, font: 'Consolas', size: 17, bold: true, color: '1E293B' })] })]
          }),
          new TableCell({
            width: { size: 44, type: WidthType.PERCENTAGE },
            shading: { fill: isAlt ? 'F8FAFC' : 'FFFFFF' },
            borders: {
              bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
              top: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
              left: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
              right: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' }
            },
            margins: { top: 60, bottom: 60, left: 80, right: 80 },
            children: [new Paragraph({ children: [new TextRun({ text: f.desc, font: 'Segoe UI', size: 17, color: '475569' })] })]
          }),
          new TableCell({
            width: { size: 8, type: WidthType.PERCENTAGE },
            shading: { fill: isAlt ? 'F8FAFC' : 'FFFFFF' },
            borders: {
              bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
              top: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
              left: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
              right: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' }
            },
            margins: { top: 60, bottom: 60, left: 80, right: 80 },
            children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: String(f.lineCount), font: 'Segoe UI', size: 17, color: '2563EB', bold: true })] })]
          }),
          new TableCell({
            width: { size: 8, type: WidthType.PERCENTAGE },
            shading: { fill: isAlt ? 'F8FAFC' : 'FFFFFF' },
            borders: {
              bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
              top: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
              left: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
              right: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' }
            },
            margins: { top: 60, bottom: 60, left: 80, right: 80 },
            children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `${f.sizeKb} KB`, font: 'Segoe UI', size: 17, color: '64748B' })] })]
          })
        ]
      })
    );
  });

  const tocTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tocRows
  });
  children.push(tocTable);
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ==================== CODE SECTIONS BY CATEGORY ====================
  let globalFileIndex = 1;

  for (const cat of fileCategories) {
    // Category Heading
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 100 },
        children: [
          new TextRun({
            text: cat.category,
            font: 'Segoe UI',
            size: 26,
            bold: true,
            color: '1E3A8A'
          })
        ]
      }),
      new Paragraph({
        spacing: { before: 0, after: 200 },
        children: [
          new TextRun({
            text: cat.description,
            font: 'Segoe UI',
            size: 19,
            italics: true,
            color: '64748B'
          })
        ]
      })
    );

    for (const f of cat.files) {
      const fileData = allFilesData.find(d => d.relPath === f.path);
      if (!fileData) continue;

      // File Header Box
      const headerTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 100, type: WidthType.PERCENTAGE },
                shading: { fill: 'F1F5F9' },
                borders: {
                  left: { style: BorderStyle.SINGLE, size: 24, color: '2563EB' },
                  top: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' },
                  bottom: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' },
                  right: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' }
                },
                margins: { top: 120, bottom: 120, left: 160, right: 160 },
                children: [
                  new Paragraph({
                    spacing: { before: 0, after: 40 },
                    children: [
                      new TextRun({
                        text: `File #${globalFileIndex}: `,
                        font: 'Segoe UI',
                        size: 20,
                        bold: true,
                        color: '2563EB'
                      }),
                      new TextRun({
                        text: fileData.relPath,
                        font: 'Consolas',
                        size: 22,
                        bold: true,
                        color: '0F172A'
                      })
                    ]
                  }),
                  new Paragraph({
                    spacing: { before: 0, after: 0 },
                    children: [
                      new TextRun({
                        text: `Purpose: `,
                        font: 'Segoe UI',
                        size: 18,
                        bold: true,
                        color: '475569'
                      }),
                      new TextRun({
                        text: `${fileData.desc}  |  `,
                        font: 'Segoe UI',
                        size: 18,
                        color: '334155'
                      }),
                      new TextRun({
                        text: `Lines: `,
                        font: 'Segoe UI',
                        size: 18,
                        bold: true,
                        color: '475569'
                      }),
                      new TextRun({
                        text: `${fileData.lineCount}  |  `,
                        font: 'Segoe UI',
                        size: 18,
                        color: '2563EB',
                        bold: true
                      }),
                      new TextRun({
                        text: `Size: `,
                        font: 'Segoe UI',
                        size: 18,
                        bold: true,
                        color: '475569'
                      }),
                      new TextRun({
                        text: `${fileData.sizeKb} KB`,
                        font: 'Segoe UI',
                        size: 18,
                        color: '64748B'
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      });

      children.push(headerTable);

      // Spacer before code
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 40 },
          children: []
        })
      );

      // Digits needed for line number padding
      const totalDigits = Math.max(3, String(fileData.lineCount).length);

      // Add each line as formatted paragraph
      fileData.lines.forEach((lineText, lIdx) => {
        const lineNumStr = padLineNumber(lIdx + 1, totalDigits);
        // Replace tabs with 4 spaces
        const cleanText = lineText.replace(/\t/g, '    ');

        children.push(
          new Paragraph({
            spacing: { before: 0, after: 0, line: 240 },
            shading: { fill: 'F8FAFC' },
            border: {
              left: { style: BorderStyle.SINGLE, size: 8, color: 'E2E8F0', space: 4 }
            },
            children: [
              new TextRun({
                text: `${lineNumStr} | `,
                font: 'Consolas',
                size: 16, // 8pt
                color: '94A3B8'
              }),
              new TextRun({
                text: cleanText.length > 0 ? cleanText : ' ',
                font: 'Consolas',
                size: 16, // 8pt
                color: '1E293B'
              })
            ]
          })
        );
      });

      // Separation after file
      children.push(
        new Paragraph({
          spacing: { before: 180, after: 180 },
          children: [
            new TextRun({
              text: `--- End of ${fileData.relPath} (${fileData.lineCount} lines) ---`,
              font: 'Segoe UI',
              size: 16,
              color: '94A3B8',
              italics: true
            })
          ]
        })
      );

      globalFileIndex++;
    }

    children.push(new Paragraph({ children: [new PageBreak()] }));
  }

  // Create document
  const doc = new Document({
    title: 'Frontend Source Code Documentation',
    description: 'Complete frontend codebase documentation in Microsoft Word format.',
    creator: 'Personal Finance Platform Team',
    styles: {
      default: {
        document: {
          run: {
            font: 'Segoe UI',
            size: 20
          }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              bottom: 1000,
              left: 1000,
              right: 1000
            }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'FinTrack - Personal Finance Platform | Frontend Source Code',
                    font: 'Segoe UI',
                    size: 16,
                    color: '94A3B8'
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
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'Page ',
                    font: 'Segoe UI',
                    size: 16,
                    color: '94A3B8'
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: 'Segoe UI',
                    size: 16,
                    color: '2563EB',
                    bold: true
                  }),
                  new TextRun({
                    text: ' of ',
                    font: 'Segoe UI',
                    size: 16,
                    color: '94A3B8'
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    font: 'Segoe UI',
                    size: 16,
                    color: '94A3B8'
                  })
                ]
              })
            ]
          })
        },
        children: children
      }
    ]
  });

  console.log('Packing docx document...');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUTPUT_FILE, buffer);
  console.log(`Document generated successfully at: ${OUTPUT_FILE}`);
  console.log(`File size: ${(buffer.length / (1024 * 1024)).toFixed(2)} MB`);
}

generateDocx().catch(err => {
  console.error('Fatal error generating docx:', err);
  process.exit(1);
});
