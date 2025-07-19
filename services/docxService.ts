
import { Packer, Document, Paragraph, TextRun, HeadingLevel, AlignmentType, SectionType, Column } from 'docx';
import type { Problem } from '../types';

export const exportProblemsToDocx = (problems: Problem[]): void => {
    if (!problems.length) return;

    // 2단 레이아웃 및 문제 간격 조정을 위한 문제 문단 생성
    const problemParagraphs = problems.flatMap((problem, index) => [
        new Paragraph({
            children: [
                new TextRun({
                    text: `${index + 1}. `,
                    bold: true,
                    size: 20, // 10pt
                }),
                new TextRun({
                    text: problem.question,
                    size: 20, // 10pt
                }),
            ],
            spacing: {
                after: 1000, // 50pt spacing for writing room
            },
        }),
    ]);
    
    // 빠른 정답 섹션 생성
    const quickAnswersText = problems.map((p, i) => `${i + 1}. ${p.answer.split('답: ')[1] || p.answer}`).join('   ');
    const quickAnswerParagraphs = [
        new Paragraph({
            text: "빠른 정답",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
             children: [new TextRun({ text: quickAnswersText, size: 20 })],
             spacing: { after: 600 },
        })
    ];

    // 상세 풀이 섹션 생성
    const detailedAnswerParagraphs = problems.map((problem, index) =>
        new Paragraph({
            children: [
                new TextRun({
                    text: `${index + 1}. `,
                    bold: true,
                    size: 20, // 10pt
                }),
                new TextRun({
                    text: problem.answer,
                    size: 20, // 10pt
                }),
            ],
            spacing: {
                after: 200, // 10pt spacing
            },
        })
    );

    const doc = new Document({
        sections: [
            { // 문제지 섹션
                properties: {
                     type: SectionType.CONTINUOUS,
                     column: {
                        count: 2,
                        space: 720, // 0.5 inch (1.27cm)
                    },
                },
                children: [
                    new Paragraph({
                        text: "수학 문장제 문제지",
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 480 },
                    }),
                    ...problemParagraphs,
                ],
            },
            { // 정답 및 풀이 섹션
                properties: {
                    type: SectionType.CONTINUOUS,
                },
                children: [
                     new Paragraph({
                        text: "정답 및 풀이",
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 600, after: 400 },
                        pageBreakBefore: true,
                    }),
                    ...quickAnswerParagraphs,
                    new Paragraph({
                        text: "상세 풀이",
                        heading: HeadingLevel.HEADING_2,
                        spacing: { before: 400, after: 200 },
                    }),
                    ...detailedAnswerParagraphs,
                ]
            }
        ],
    });

    Packer.toBlob(doc).then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "math_problems.docx";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
};