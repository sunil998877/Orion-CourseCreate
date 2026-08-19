import { OpenAI } from 'openai';
import { handleOpenAIError } from '../../utils/openaiErrorHandler.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy-key' });

export const chatWithAI = async (req, res) => {
  console.log("Controller Hit - chatWithAI");
  const { prompt1, prompt2, prompt, moduleContext, history } = req.body;

  if (prompt && !prompt1 && !prompt2) {
    try {
      const messages = [
        {
          role: "system",
          content: `You are an AI Course Architect. Your goal is to help the user refine their course modules. 
          You should be professional, technical where needed, and always focus on instructional design best practices.
          Current Module Context: ${JSON.stringify(moduleContext)}`
        },
        ...(history || []),
        { role: "user", content: prompt }
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages,
      });

      const aiMessage = response.choices[0].message.content;
      return res.json({ message: aiMessage });
    } catch (error) {
      return handleOpenAIError(error, res, 'chatWithAI');
    }
  }

  let content = null;
  let slides = null;

  try {
    const cleanJSON = (text) => {
      if (!text) return null;
      const matches = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/g);
      if (!matches) {
        return { rawText: text };
      }
      for (let i = matches.length - 1; i >= 0; i--) {
        try {
          return JSON.parse(matches[i]);
        } catch (e) {
          continue;
        }
      }
      return { rawText: text };
    };

    let raw1 = null;

    if (prompt1) {
      try {
        console.log("[DEBUG] Calling OpenAI for Prompt 1...");
        const r1 = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt1 }],
          temperature: 0.3
        });
        raw1 = r1.choices?.[0]?.message?.content;
        console.log("RAW CONTENT AI:", raw1);
        content = cleanJSON(raw1);
        console.log("[DEBUG] Parsed content from AI:", JSON.stringify(content, null, 2));
        if (content?.modules?.[0]) {
          const m = content.modules[0];

          content = {
            Title: m.ModuleTitle || m.title || "Module",
            Objectives: m.LearningObjectives || m.Objectives || [],
            TeachingContent: m.TeachingContent || (m.LessonTitles || []).map(title => ({
              Topics: title,
              StandardsReference: "AI Generated",
              ContentPoints: []
            })),
            CaseStudy: m.CaseStudy || {
              CaseStudyDescription: m.SlideDeckOutline?.CaseStudy || "",
              Questions: [],
              ModelAnswers: []
            },
            Quizzes: m.Quizzes || [],
            VisualDescriptions: m.VisualDescriptions || [],
            FurtherStudy: m.FurtherStudy || {
              ExternalLinks: [],
              BookReferences: []
            }
          };
          console.log("[DEBUG] Final content structure:", JSON.stringify(content, null, 2));
        }

      } catch (aiErr) {
        console.error("[DEBUG] OpenAI Prompt 1 Error:", aiErr.message);
        return res.status(500).json({
          error: "OpenAI Generation Failed",
          details: aiErr.message,
          phase: "prompt1"
        });
      }
    }

    if (prompt2) {
      try {
        console.log("[DEBUG] Calling OpenAI for Prompt 2 (Slides)...");
        const r2 = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt2 + "\nProduce exactly 10 slides. Return JSON: { \"Slides\": [...] }" }],
          temperature: 0.3,
          response_format: { type: "json_object" }
        });
        let raw2 = r2.choices?.[0]?.message?.content;
        console.log("RAW SLIDES AI:", raw2);
        slides = cleanJSON(raw2);

        if (slides && Array.isArray(slides.Slides)) {
          let s = slides.Slides.map((sl, idx) => ({
            SlideNumber: Number(sl.SlideNumber ?? idx + 1),
            Title: String(sl.Title ?? sl.title ?? `Slide ${idx + 1}`),
            Bullets: Array.isArray(sl.Bullets) ? sl.Bullets : Array.isArray(sl.BulletPoints) ? sl.BulletPoints : [],
            Content: typeof sl.Content === 'string' ? sl.Content : '',
            VisualPrompt: typeof sl.VisualPrompt === 'string' ? sl.VisualPrompt : '',
            Transcript: typeof sl.Transcript === 'string' ? sl.Transcript : ''
          }));
          if (s.length < 10) {
            console.log(`[DEBUG] Padding chat slides from ${s.length} to 10`);
            for (let i = s.length; i < 10; i++) {
              s.push({
                SlideNumber: i + 1,
                Title: `Slide ${i + 1} - Topic Summary`,
                Bullets: ["Key learning point", "Practical application", "Important takeaway"],
                Content: "Reinforcing the module's core concepts through detailed review and practical context.",
                VisualPrompt: "Educational graphic summarizing the section concepts.",
                Transcript: "This slide summarizes the key concepts we just covered."
              });
            }
          }
          slides.Slides = s.slice(0, 10);
        } else if (Array.isArray(slides)) {
          let s = slides.map((sl, idx) => ({
            SlideNumber: Number(sl.SlideNumber ?? idx + 1),
            Title: String(sl.Title ?? sl.title ?? `Slide ${idx + 1}`),
            Bullets: Array.isArray(sl.Bullets) ? sl.Bullets : Array.isArray(sl.BulletPoints) ? sl.BulletPoints : [],
            Content: typeof sl.Content === 'string' ? sl.Content : '',
            VisualPrompt: typeof sl.VisualPrompt === 'string' ? sl.VisualPrompt : '',
            Transcript: typeof sl.Transcript === 'string' ? sl.Transcript : ''
          }));
          for (let i = s.length; i < 10; i++) {
            s.push({ SlideNumber: i + 1, Title: `Slide ${i + 1} - Review`, Bullets: [], Content: "", VisualPrompt: "", Transcript: "" });
          }
          slides = { Slides: s.slice(0, 10) };
        }
      } catch (aiErr) {
        console.error("[DEBUG] OpenAI Prompt 2 Error:", aiErr.message);
        slides = {
          Slides: Array.from({ length: 10 }, (_, i) => ({
            SlideNumber: i + 1,
            Title: `Slide ${i + 1}`,
            Bullets: ["Topic point"],
            Content: "Learning content placeholder.",
            VisualPrompt: "Educational illustration.",
            Transcript: ""
          }))
        };
      }
    }

    if (!content) {
      console.log("[DEBUG] No parseable content found. Raw content:", raw1);
      if (raw1) {
        return res.json({
          reply1: { rawText: raw1 },
          reply2: slides || null
        });
      }
      return res.status(500).json({ error: "AI returned no content" });
    }

    console.log("[DEBUG] Sending JSON response to frontend");
    res.json({
      reply1: content || (raw1 ? { rawText: raw1 } : null),
      reply2: slides || null
    });

  } catch (err) {
    return handleOpenAIError(err, res, 'chatWithAI');
  }
};
