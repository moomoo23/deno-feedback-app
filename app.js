import { Eta } from "https://deno.land/x/eta@v3.4.0/src/index.ts";
import { Hono } from "https://deno.land/x/hono@v3.12.11/mod.ts";
import { getCookie, setCookie } from "https://deno.land/x/hono@v3.12.11/helper.ts";

import * as feedbacks from "./feedbacks.js";
import * as courseController from "./courseController.js";

const eta = new Eta({ views: `${Deno.cwd()}/templates/` });
const app = new Hono();

function getUserId(c) {
  let userId = getCookie(c, 'userId');
  if (!userId) {
    userId = crypto.randomUUID();
    setCookie(c, 'userId', userId);
  }
  return userId;
}

app.get("/courses/:courseId/feedbacks/:feedbackId", async (c) => {
  const courseId = c.req.param("courseId");
  const feedbackId = c.req.param("feedbackId");
  const feedbackCount = await feedbacks.getFeedbackCount(courseId, feedbackId);
  return c.text(`Feedback ${feedbackId}: ${feedbackCount}`);
});

app.post("/courses/:courseId/feedbacks/:feedbackId", async (c) => {
  const courseId = c.req.param("courseId");
  const feedbackId = c.req.param("feedbackId");
  const userId = getUserId(c);
  await feedbacks.incrementFeedbackCount(courseId, feedbackId, userId);
  return c.redirect(`/courses/${courseId}`);
});

app.get("/courses", courseController.showForm);
app.get("/courses/:id", async (c) => {
  c.set('userId', getUserId(c));
  return courseController.showCourse(c);
});
app.post("/courses", courseController.createCourse);
app.post("/courses/:id/delete", courseController.deleteCourse);

export default app;