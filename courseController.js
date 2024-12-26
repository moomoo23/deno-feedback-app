import { Eta } from "https://deno.land/x/eta@v3.4.0/src/index.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

import * as courseService from "./courseService.js";
import * as feedbacks from "./feedbacks.js";

const nameError = "The course name should be a string of at least 4 characters.";
const courseValidator = z.object({
  name: z.string({ message: nameError }).min(4, { message: nameError }),
});

const eta = new Eta({ views: `${Deno.cwd()}/templates/` });

const showForm = async (c) => {
  return c.html(
    eta.render("courses.eta", { courses: await courseService.listCourses() }),
  );
};

const createCourse = async (c) => {
  const body = await c.req.parseBody();
  const validationResult = courseValidator.safeParse(body);
  if (!validationResult.success) {
    return c.html(eta.render("courses.eta", {
      ...body,
      courses: await courseService.listCourses(),
      errors: validationResult.error.format(),
    }));
  }

  await courseService.createCourse(body);
  return c.redirect("/courses");
};

const showCourse = async (c) => {
  const id = c.req.param("id");
  const userId = c.get('userId');
  const hasGivenFeedback = await feedbacks.hasUserGivenFeedback(id, userId);

  return c.html(
    eta.render("course.eta", {
      course: await courseService.getCourse(id),
      hasGivenFeedback: hasGivenFeedback
    }),
  );
};

const deleteCourse = async (c) => {
  const id = c.req.param("id");
  await courseService.deleteCourse(id);
  return c.redirect("/courses");
};

export { createCourse, deleteCourse, showCourse, showForm };