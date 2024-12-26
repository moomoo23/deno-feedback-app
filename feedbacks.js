const getFeedbackCount = async (course, id) => {
  const kv = await Deno.openKv();
  const store = await kv.get(["feedbacks", course, id]);
  return store?.value ?? 0;
};

const hasUserGivenFeedback = async (courseId, userId) => {
  const kv = await Deno.openKv();
  const feedback = await kv.get(["user-feedbacks", courseId, userId]);
  return !!feedback?.value;
};

const incrementFeedbackCount = async (course, id, userId) => {
  const kv = await Deno.openKv();
  const hasGiven = await hasUserGivenFeedback(course, userId);
  if (hasGiven) {
    return false;
  }
  const count = await getFeedbackCount(course, id);
  await kv.set(["feedbacks", course, id], count + 1);
  await kv.set(["user-feedbacks", course, userId], true);
  return true;
};

export { getFeedbackCount, incrementFeedbackCount, hasUserGivenFeedback };