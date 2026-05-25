import { NextResponse } from 'next/server';

export async function POST(req) {
  const { accessToken } = await req.json();


  async function ApiGoogle(url) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.json();
  }



  async function getAllGrades(courseWorks, course) {
    const promises = courseWorks.map(async work => {
      try {
        const mySubmissionData = await ApiGoogle(
          `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork/${work.id}/studentSubmissions?userId=me`
        );
        const mySubmission = mySubmissionData.studentSubmissions?.[0];

        return {
          courseName: course.name,
          workTitle: work.title,
          type: workTitle(work),
          state: mySubmission?.state || 'NOT_SUBMITTED',
          grade: mySubmission?.assignedGrade ?? null,
          createdAt: mySubmission?.creationTime,
          link: mySubmission?.alternateLink,
          updated: mySubmission?.updateTime ?? null,
          //assignmentData: mySubmission?.assignmentSubmission,
          dueDate: work.dueDate ? `${work.dueDate.year}-${work.dueDate.month}-${work.dueDate.day}` : 'לא מוגדר',
        };
      } catch {
        return null;
      }
    });

    return Promise.all(promises);
  }

  function workTitle(work) {
    const title = work.title.toLowerCase();
    return title.includes('אמצע') ? 'בוחן אמצע' :
      title.includes('בוחן') ? 'בוחן אמצע' :
        title.includes('סופי') ? 'בוחן סופי' :
          title.includes('פרויקט') ? 'בוחן סופי' :
            title.includes('מבחן') ? 'בוחן סופי' :
              title.includes('exam') ? 'exam' :
                title.includes('project') ? 'project' :
                  title.includes('final') ? 'exam' :
                    title.includes('midterm') ? 'midterm' : 'other';
  }





  try {
    //  שלב ראשון: משיכת כל הקורסים
    const coursesData = await ApiGoogle(
      'https://classroom.googleapis.com/v1/courses?pageSize=100'
    );

    const courses = coursesData.courses || [];

    //  שלב שני: משיכת כל המשימות בלבד
    const courseWorksMap = {}; // { courseId : [works] }
    for (const course of courses) {
      const worksRes = await ApiGoogle(
        `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork?pageSize=200`
      );

      courseWorksMap[course.id] = worksRes.courseWork || [];
    }

    //  שלב שלישי: עיבוד הציונים לאחר שכל הנתונים נאספו
    const grades = [];
    for (const course of courses) {
      const works = courseWorksMap[course.id] || [];

      if (works.length > 0) {
        const processed = await getAllGrades(works, course);
        grades.push(...processed);
      }
    }

    // תשובה מסודרת
    return NextResponse.json({
      courses,
      works: courseWorksMap,
      grades
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to fetch grades', courses: [], works: {}, grades: [] },
      { status: 500 }
    );
  }
}
