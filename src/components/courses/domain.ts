import { getCourses, fetchCourse } from './data-access'

export async function getCourseList() {
    const response = await getCourses()
    return response
}

export async function getCourse(courseid: string) {
    const response = await fetchCourse(courseid)
    return response
}
