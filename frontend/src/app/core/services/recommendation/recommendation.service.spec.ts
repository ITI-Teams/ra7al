import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RecommendationService, RecommendationQuestion } from './recommendation.service';
import { environment } from '../../../environments/environment';

describe('RecommendationService', () => {
  let service: RecommendationService;
  let httpMock: HttpTestingController;

  const mockQuestions: RecommendationQuestion[] = [
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
    },
    {
      id: 3,
      question: 'Amenities?',
      question_type: 'multi_select',
      options: ['WiFi', 'Gym', 'Pool'],
      category: 'Amenities',
      is_required: false,
      order: 3
    }
  ];

  const mockRecommendations = {
    success: true,
    data: [
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
        matching_percentage: 95
      }
    ],
    session_id: 'session-123',
    message: 'Success'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RecommendationService]
    });

    service = TestBed.inject(RecommendationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getQuestions', () => {
    it('should fetch questions from API', () => {
      const mockResponse = {
        success: true,
        data: mockQuestions,
        total: 3
      };

      service.getQuestions().subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data.length).toBe(3);
        expect(response.total).toBe(3);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/recommendations/questions`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle API error', () => {
      service.getQuestions().subscribe(
        () => fail('should have failed'),
        error => {
          expect(error).toBeTruthy();
        }
      );

      const req = httpMock.expectOne(`${environment.apiUrl}/recommendations/questions`);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('getRecommendations', () => {
    it('should submit answers and get recommendations', () => {
      const answers = {
        1: 'Cairo',
        2: 5000,
        3: ['WiFi', 'Gym']
      };

      service.getRecommendations(answers).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data.length).toBe(1);
        expect(response.session_id).toBe('session-123');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/recommendations`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.answers).toEqual(answers);
      req.flush(mockRecommendations);
    });

    it('should format answers correctly', () => {
      const answers = {
        1: { value: 'Cairo' },
        2: { value: 5000 }
      };

      service.getRecommendations(answers).subscribe(() => {});

      const req = httpMock.expectOne(`${environment.apiUrl}/recommendations`);
      expect(req.request.body).toEqual({ answers });
    });
  });

  describe('getHistory', () => {
    it('should fetch recommendation history', () => {
      const mockHistory = {
        success: true,
        data: []
      };

      service.getHistory().subscribe(response => {
        expect(response.success).toBe(true);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/recommendations/history`);
      expect(req.request.method).toBe('GET');
      req.flush(mockHistory);
    });
  });

  describe('groupQuestionsByCategory', () => {
    it('should group questions by category', () => {
      const grouped = service.groupQuestionsByCategory(mockQuestions);

      expect(grouped.has('Location')).toBe(true);
      expect(grouped.has('Budget')).toBe(true);
      expect(grouped.has('Amenities')).toBe(true);

      expect(grouped.get('Location')!.length).toBe(1);
      expect(grouped.get('Budget')!.length).toBe(1);
      expect(grouped.get('Amenities')!.length).toBe(1);
    });

    it('should handle empty questions array', () => {
      const grouped = service.groupQuestionsByCategory([]);

      expect(grouped.size).toBe(0);
    });

    it('should group multiple questions in same category', () => {
      const questions = [
        { ...mockQuestions[0], id: 1 },
        { ...mockQuestions[0], id: 2, question: 'Which area?' }
      ];

      const grouped = service.groupQuestionsByCategory(questions);

      expect(grouped.get('Location')!.length).toBe(2);
    });
  });

  describe('getCategoriesInOrder', () => {
    it('should return categories in order', () => {
      const categories = service.getCategoriesInOrder(mockQuestions);

      expect(categories).toEqual(['Location', 'Budget', 'Amenities']);
    });

    it('should preserve question order', () => {
      const unorderedQuestions = [
        { ...mockQuestions[2], order: 3 },
        { ...mockQuestions[0], order: 1 },
        { ...mockQuestions[1], order: 2 }
      ];

      const categories = service.getCategoriesInOrder(unorderedQuestions);

      expect(categories[0]).toBe('Location');
      expect(categories[1]).toBe('Budget');
      expect(categories[2]).toBe('Amenities');
    });

    it('should not duplicate categories', () => {
      const questions = [
        mockQuestions[0],
        mockQuestions[0],
        mockQuestions[1]
      ];

      const categories = service.getCategoriesInOrder(questions);

      expect(categories.filter(c => c === 'Location').length).toBe(1);
    });

    it('should handle empty array', () => {
      const categories = service.getCategoriesInOrder([]);

      expect(categories).toEqual([]);
    });
  });
});
