import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RecommendationComponent } from './recommendation';
import { RecommendationService } from '../../core/services/recommendation/recommendation.service';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';

describe('RecommendationComponent', () => {
  let component: RecommendationComponent;
  let fixture: ComponentFixture<RecommendationComponent>;
  let recommendationService: jasmine.SpyObj<RecommendationService>;
  let messageService: jasmine.SpyObj<MessageService>;

  const mockQuestions = [
    {
      id: 1,
      question: 'What city?',
      question_type: 'select',
      options: ['Cairo', 'Giza'],
      category: 'Location',
      is_required: true,
      order: 1
    },
    {
      id: 2,
      question: 'Budget?',
      question_type: 'range',
      options: [{ min: 1000, max: 10000 }],
      category: 'Budget',
      is_required: true,
      order: 2
    }
  ];

  const mockRecommendations = [
    {
      id: 1,
      title: 'Apartment A',
      location: 'Cairo',
      price: 3500,
      image: 'image.jpg',
      rooms: 2,
      baths: 1,
      beds: 2,
      gender: 'Males',
      available_spots: 2,
      bills_included: true,
      matching_percentage: 95,
      reason: 'Great match'
    }
  ];

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('RecommendationService', [
      'getQuestions',
      'getRecommendations',
      'getHistory',
      'groupQuestionsByCategory',
      'getCategoriesInOrder'
    ]);

    const messageSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [RecommendationComponent, HttpClientTestingModule],
      providers: [
        { provide: RecommendationService, useValue: serviceSpy },
        { provide: MessageService, useValue: messageSpy }
      ]
    }).compileComponents();

    recommendationService = TestBed.inject(RecommendationService) as jasmine.SpyObj<RecommendationService>;
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    fixture = TestBed.createComponent(RecommendationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Question Loading', () => {
    it('should load questions on init', () => {
      recommendationService.getQuestions.and.returnValue(
        of({ success: true, data: mockQuestions, total: 2 })
      );
      recommendationService.getCategoriesInOrder.and.returnValue(['Location', 'Budget']);

      component.ngOnInit();

      expect(recommendationService.getQuestions).toHaveBeenCalled();
      expect(component.allQuestions().length).toBe(2);
    });

    it('should handle error loading questions', () => {
      recommendationService.getQuestions.and.returnValue(
        throwError(() => new Error('API Error'))
      );

      component.ngOnInit();

      expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
        severity: 'error'
      }));
    });
  });

  describe('Question Grouping', () => {
    it('should group questions by category', () => {
      recommendationService.getQuestions.and.returnValue(
        of({ success: true, data: mockQuestions, total: 2 })
      );
      recommendationService.getCategoriesInOrder.and.returnValue(['Location', 'Budget']);

      component.ngOnInit();

      expect(component.questionGroups().length).toBe(2);
      expect(component.categories()).toContain('Location');
      expect(component.categories()).toContain('Budget');
    });
  });

  describe('Answer Management', () => {
    beforeEach(() => {
      component.formAnswers.set({ 1: 'Cairo', 2: 5000 });
    });

    it('should update answer on question change', () => {
      component.updateAnswer(1, 'Giza');

      expect(component.formAnswers()[1]).toBe('Giza');
    });

    it('should track total questions answered', () => {
      expect(component.totalQuestionsAnswered()).toBe(2);
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      component.questionGroups.set([
        { category: 'Location', questions: mockQuestions.slice(0, 1) },
        { category: 'Budget', questions: mockQuestions.slice(1) }
      ]);
      component.categories.set(['Location', 'Budget']);
      component.formAnswers.set({ 1: 'Cairo', 2: 5000 });
    });

    it('should move to next group when current group answered', () => {
      component.nextGroup();

      expect(component.currentCategoryIndex()).toBe(1);
    });

    it('should not move to next group if required questions not answered', () => {
      component.formAnswers.set({});

      component.nextGroup();

      expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
        severity: 'warn'
      }));
    });

    it('should move to previous group', () => {
      component.currentCategoryIndex.set(1);

      component.prevGroup();

      expect(component.currentCategoryIndex()).toBe(0);
    });

    it('should not go below first group', () => {
      component.currentCategoryIndex.set(0);

      component.prevGroup();

      expect(component.currentCategoryIndex()).toBe(0);
    });
  });

  describe('Submit Answers', () => {
    beforeEach(() => {
      component.formAnswers.set({ 1: 'Cairo', 2: 5000 });
      component.questionGroups.set([
        { category: 'Location', questions: mockQuestions.slice(0, 1) }
      ]);
    });

    it('should submit answers and show results', () => {
      recommendationService.getRecommendations.and.returnValue(
        of({
          success: true,
          data: mockRecommendations,
          session_id: 'session-123',
          message: 'Success'
        })
      );

      component.submitAnswers();

      expect(recommendationService.getRecommendations).toHaveBeenCalled();
      expect(component.showResults()).toBe(true);
      expect(component.recommendedProperties().length).toBe(1);
    });

    it('should handle error submitting answers', () => {
      recommendationService.getRecommendations.and.returnValue(
        throwError(() => new Error('Submit Error'))
      );

      component.submitAnswers();

      expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
        severity: 'error'
      }));
    });
  });

  describe('Results Display', () => {
    beforeEach(() => {
      component.recommendedProperties.set(mockRecommendations);
      component.showResults.set(true);
    });

    it('should paginate properties', () => {
      component.rows.set(1);
      component.currentPage.set(1);

      expect(component.paginatedProperties().length).toBe(1);
    });

    it('should have correct total records', () => {
      expect(component.totalRecords()).toBe(1);
    });
  });

  describe('Restart Recommendation', () => {
    it('should reset all state', () => {
      component.currentCategoryIndex.set(2);
      component.formAnswers.set({ 1: 'value' });
      component.showResults.set(true);
      component.recommendedProperties.set(mockRecommendations);

      component.restartRecommendation();

      expect(component.currentCategoryIndex()).toBe(0);
      expect(component.formAnswers()).toEqual({});
      expect(component.showResults()).toBe(false);
      expect(component.recommendedProperties().length).toBe(0);
    });
  });

  describe('Save Recommendations', () => {
    beforeEach(() => {
      component.recommendedProperties.set(mockRecommendations);
      component.sessionId.set('session-123');
      component.formAnswers.set({ 1: 'Cairo' });
    });

    it('should save recommendations to localStorage', () => {
      spyOn(localStorage, 'setItem');

      component.saveRecommendations();

      expect(localStorage.setItem).toHaveBeenCalledWith('savedRecommendations', jasmine.any(String));
      expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
        severity: 'success'
      }));
    });
  });

  describe('Question Type Detection', () => {
    it('should detect text questions', () => {
      const question = { ...mockQuestions[0], question_type: 'text' };

      expect(component.isTextQuestion(question)).toBe(true);
    });

    it('should detect select questions', () => {
      expect(component.isSelectQuestion(mockQuestions[0])).toBe(true);
    });

    it('should detect range questions', () => {
      expect(component.isRangeQuestion(mockQuestions[1])).toBe(true);
    });
  });
});
