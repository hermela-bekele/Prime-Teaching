from enum import Enum

class SchoolType(str, Enum):
    PRIVATE = "private"
    PUBLIC = "public"
    PILOT = "pilot"
    OTHER = "other"

class Status(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PILOT = "pilot"

class UserRole(str, Enum):
    TEACHER = "teacher"
    DEPARTMENT_HEAD = "department_head"
    SCHOOL_LEADER = "school_leader"
    ADMIN = "admin"

class ActiveStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"

class VisibilityScope(str, Enum):
    OWN_RECORDS = "own_records"
    DEPARTMENT_RECORDS = "department_records"
    SCHOOL_RECORDS = "school_records"
    ALL_RECORDS = "all_records"

class GradeLevel(str, Enum):
    GRADE_11 = "grade_11"

class StreamType(str, Enum):
    CORE = "core"
    NATURAL_SCIENCE = "natural_science"
    SOCIAL_SCIENCE = "social_science"

class DifficultyLevel(str, Enum):
    FOUNDATIONAL = "foundational"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    BASIC = "basic"
    MIXED = "mixed"
    EXAM_STANDARD = "exam_standard"

class AudienceScope(str, Enum):
    TEACHER = "teacher"
    DEPARTMENT = "department"
    SCHOOL = "school"

class SequencingMode(str, Enum):
    TEXTBOOK_ORDER = "textbook_order"
    OPTIMIZED_SEQUENCE = "optimized_sequence"

class GenerationStatus(str, Enum):
    DRAFT = "draft"
    GENERATED = "generated"
    REVIEWED = "reviewed"
    APPROVED = "approved"

class SessionType(str, Enum):
    TEACHING = "teaching"
    REVISION = "revision"
    QUIZ = "quiz"
    TEST_PREP = "test_prep"
    UNIT_TEST = "unit_test"

class SessionStatus(str, Enum):
    PLANNED = "planned"
    GENERATED = "generated"
    DELIVERED = "delivered"
    MISSED = "missed"
    RESCHEDULED = "rescheduled"

class AssessmentType(str, Enum):
    QUIZ = "quiz"
    UNIT_TEST = "unit_test"
    TERM_EXAM = "term_exam"
    PRACTICE_SET = "practice_set"

class CompletionStatus(str, Enum):
    NOT_STARTED = "not_started"
    COMPLETED = "completed"
    PARTIALLY_COMPLETED = "partially_completed"
    MISSED = "missed"
    RESCHEDULED = "rescheduled"

class DeliveryConfidence(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class DeptReviewStatus(str, Enum):
    NOT_REVIEWED = "not_reviewed"
    REVIEWED = "reviewed"
    SUPPORT_REQUIRED = "support_required"

class ResourceType(str, Enum):
    TEXTBOOK = "textbook"
    TEACHER_GUIDE = "teacher_guide"
    WORKSHEET = "worksheet"
    VIDEO_LINK = "video_link"
    WEBSITE_LINK = "website_link"
    OTHER = "other"

class ResourceScope(str, Enum):
    GLOBAL = "global"
    SCHOOL_ONLY = "school_only"
    DEPARTMENT_ONLY = "department_only"

class ApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    DRAFT = "draft"
    ARCHIVED = "archived"

class JobType(str, Enum):
    CALENDAR_GENERATION = "calendar_generation"
    LESSON_PLAN_GENERATION = "lesson_plan_generation"
    TEACHING_NOTE_GENERATION = "teaching_note_generation"
    ASSESSMENT_GENERATION = "assessment_generation"

class JobStatus(str, Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"