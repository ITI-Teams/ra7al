import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PaginatorModule } from 'primeng/paginator';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RecommendationService, RecommendationQuestion, RecommendedProperty } from '../../core/services/recommendation/recommendation.service';
import { Router } from '@angular/router';

interface QuestionGroup {
  category: string;
  questions: RecommendationQuestion[];
}

interface FormAnswers {
  [key: number]: any;
}

@Component({
  selector: 'app-recommendation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    PaginatorModule,
    ToastModule
  ],
  templateUrl: './recommendation.html',
  styleUrl: './recommendation.css',
  providers: [MessageService]
})
export class RecommendationComponent implements OnInit {
  private recommendationService = inject(RecommendationService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  // State signals
  isLoadingQuestions = signal(false);
  isSubmittingAnswers = signal(false);
  showResults = signal(false);

  allQuestions = signal<RecommendationQuestion[]>([]);
  questionGroups = signal<QuestionGroup[]>([]);
  categories = signal<string[]>([]);

  currentCategoryIndex = signal(0);
  formAnswers = signal<FormAnswers>({});

  recommendedProperties = signal<RecommendedProperty[]>([]);
  sessionId = signal<string>('');

  // Pagination
  currentPage = signal(1);
  rows = signal(6);
  totalRecords = computed(() => this.recommendedProperties().length);

  paginatedProperties = computed(() => {
    const start = (this.currentPage() - 1) * this.rows();
    const end = start + this.rows();
    return this.recommendedProperties().slice(start, end);
  });

  currentGroup = computed(() => {
    const index = this.currentCategoryIndex();
    return this.questionGroups()[index] || null;
  });

  currentCategoryName = computed(() => {
    return this.categories()[this.currentCategoryIndex()] || '';
  });

  currentGroupQuestionCount = computed(() => {
    const group = this.currentGroup();
    return group ? group.questions.length : 0;
  });

  progressPercentage = computed(() => {
    const total = this.questionGroups().length;
    return total > 0 ? ((this.currentCategoryIndex() + 1) / total) * 100 : 0;
  });

  totalQuestionsAnswered = computed(() => {
    return Object.keys(this.formAnswers()).length;
  });

  totalQuestionsRequired = computed(() => {
    return this.allQuestions().filter(q => q.is_required).length;
  });

  ngOnInit() {
    this.loadQuestions();
  }

  loadQuestions() {
    this.isLoadingQuestions.set(true);
    this.recommendationService.getQuestions().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Parse options if they're JSON strings
          const parsedQuestions = response.data.map(q => ({
            ...q,
            options: typeof q.options === 'string' ? (() => {
              try { return JSON.parse(q.options); } catch(e) { return q.options; }
            })() : q.options
          }));

          // Deduplicate questions client-side by question text to avoid duplicate rows
          // coming from the database (keeps first occurrence)
          const uniqueByQuestion = new Map<string, RecommendationQuestion>();
          parsedQuestions.forEach((q: RecommendationQuestion) => {
            const key = (q.question || '').trim();
            if (!uniqueByQuestion.has(key)) {
              uniqueByQuestion.set(key, q);
            }
          });

          const dedupedQuestions = Array.from(uniqueByQuestion.values());

          this.allQuestions.set(dedupedQuestions);

          // Group questions by category
          const categories = this.recommendationService.getCategoriesInOrder(dedupedQuestions);
          this.categories.set(categories);

          const grouped: QuestionGroup[] = categories.map(category => ({
            category,
            questions: dedupedQuestions.filter(q => q.category === category)
          }));

          this.questionGroups.set(grouped);
          this.isLoadingQuestions.set(false);
        }
      },
      error: (error) => {
        console.error('Error loading questions:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load recommendation questions'
        });
        this.isLoadingQuestions.set(false);
      }
    });
  }

  updateAnswer(questionId: number, value: any) {
    const answers = { ...this.formAnswers() };
    answers[questionId] = value;
    this.formAnswers.set(answers);
  }

  updateMultiSelectAnswer(questionId: number, option: string, isChecked: boolean) {
    const answers = { ...this.formAnswers() };
    const currentValue = answers[questionId] || [];
    if (isChecked) {
      answers[questionId] = [...currentValue, option];
    } else {
      answers[questionId] = currentValue.filter((v: any) => v !== option);
    }
    this.formAnswers.set(answers);
  }

  getMultiSelectValue(questionId: number): string[] {
    return this.formAnswers()[questionId] || [];
  }

  isCurrentGroupAnswered = computed((): boolean => {
    const group = this.currentGroup();
    if (!group) return true;

    const answers = this.formAnswers();
    return group.questions.every(q => {
      if (q.is_required) {
        const answer = answers[q.id];
        return answer !== undefined && answer !== null && answer !== '';
      }
      return true;
    });
  });

  nextGroup() {
    if (this.isCurrentGroupAnswered()) {
      const nextIndex = this.currentCategoryIndex() + 1;
      if (nextIndex < this.questionGroups().length) {
        this.currentCategoryIndex.set(nextIndex);
      } else {
        // All groups completed, submit answers
        this.submitAnswers();
      }
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Incomplete',
        detail: 'Please answer all required questions in this group'
      });
    }
  }

  prevGroup() {
    const prevIndex = this.currentCategoryIndex() - 1;
    if (prevIndex >= 0) {
      this.currentCategoryIndex.set(prevIndex);
    }
  }

  submitAnswers() {
    if (!this.isCurrentGroupAnswered()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Incomplete',
        detail: 'Please answer all required questions'
      });
      return;
    }

    this.isSubmittingAnswers.set(true);

    // Format answers for API
    const formattedAnswers: any = {};
    Object.entries(this.formAnswers()).forEach(([key, value]) => {
      formattedAnswers[key] = { value };
    });

    this.recommendationService.getRecommendations(formattedAnswers).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.recommendedProperties.set(response.data);
          this.sessionId.set(response.session_id);
          this.showResults.set(true);
          this.isSubmittingAnswers.set(false);

          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Recommendations generated successfully!'
          });
        }
      },
      error: (error) => {
        console.error('Error submitting answers:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to generate recommendations'
        });
        this.isSubmittingAnswers.set(false);
      }
    });
  }

  restartRecommendation() {
    this.currentCategoryIndex.set(0);
    this.formAnswers.set({});
    this.showResults.set(false);
    this.recommendedProperties.set([]);
    this.sessionId.set('');
  }

  saveRecommendations() {
    if (this.recommendedProperties().length > 0) {
      // Save to localStorage
      const savedData = {
        sessionId: this.sessionId(),
        properties: this.recommendedProperties(),
        answers: this.formAnswers(),
        timestamp: new Date().toISOString()
      };

      localStorage.setItem('savedRecommendations', JSON.stringify(savedData));

      this.messageService.add({
        severity: 'success',
        summary: 'Saved',
        detail: 'Recommendations saved successfully'
      });
    }
  }

  viewPropertyDetails(propertyId: number) {
    this.router.navigate(['/properties', propertyId]);
  }

  onPageChange(event: any) {
    this.currentPage.set((event.page || 0) + 1);
  }

  getQuestionType(question: RecommendationQuestion): string {
    return question.question_type || 'text';
  }

  isSelectQuestion(question: RecommendationQuestion): boolean {
    return this.getQuestionType(question) === 'select' || this.getQuestionType(question) === 'single_choice';
  }

  isMultiSelectQuestion(question: RecommendationQuestion): boolean {
    return this.getQuestionType(question) === 'multi_select' || this.getQuestionType(question) === 'multiple_choice';
  }

  isRangeQuestion(question: RecommendationQuestion): boolean {
    return this.getQuestionType(question) === 'range';
  }

  isTextQuestion(question: RecommendationQuestion): boolean {
    return this.getQuestionType(question) === 'text';
  }

  isBooleanQuestion(question: RecommendationQuestion): boolean {
    return this.getQuestionType(question) === 'boolean';
  }

  /**
   * Get options array from question, handling JSON string parsing
   */
  getOptions(question: RecommendationQuestion): any[] {
    if (!question.options) return [];

    // If it's already an array, return it
    if (Array.isArray(question.options)) {
      return question.options;
    }

    // If it's a string (JSON), parse it
    if (typeof question.options === 'string') {
      try {
        const parsed = JSON.parse(question.options);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Error parsing options:', e);
        return [];
      }
    }

    // If it's an object (for range questions), return as array
    if (typeof question.options === 'object') {
      return [question.options];
    }

    return [];
  }
}
