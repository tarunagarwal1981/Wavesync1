import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mockTraining } from '../data/mockData';
import { 
  GraduationCap, 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  Calendar, 
  User, 
  MapPin, 
  DollarSign, 
  Filter,
  Search,
  SortAsc,
  SortDesc,
  BookOpen,
  Award,
  Download,
  Eye,
  Star,
  Users,
  TrendingUp,
  Target,
  AlertCircle
} from 'lucide-react';

const Training = () => {
  const { user } = useAuth();
  const [courses] = useState(mockTraining);
  const [selectedTab, setSelectedTab] = useState<'all' | 'enrolled' | 'completed' | 'available'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'date' | 'progress' | 'cost'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter courses based on selected tab
  const filteredCourses = courses.filter(course => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'enrolled') return course.status === 'enrolled' || course.status === 'in_progress';
    if (selectedTab === 'completed') return course.status === 'completed';
    if (selectedTab === 'available') return course.status === 'available';
    return true;
  });

  // Filter by search query
  const searchFilteredCourses = filteredCourses.filter(course => {
    const query = searchQuery.toLowerCase();
    return (
      course.title.toLowerCase().includes(query) ||
      course.description.toLowerCase().includes(query) ||
      course.provider.toLowerCase().includes(query) ||
      course.category.toLowerCase().includes(query)
    );
  });

  // Sort courses
  const sortedCourses = [...searchFilteredCourses].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'date':
        comparison = new Date(a.enrolledAt || a.createdAt).getTime() - new Date(b.enrolledAt || b.createdAt).getTime();
        break;
      case 'progress':
        comparison = a.progress - b.progress;
        break;
      case 'cost':
        comparison = a.cost - b.cost;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in_progress': return '#3b82f6';
      case 'enrolled': return '#8b5cf6';
      case 'available': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in_progress': return Play;
      case 'enrolled': return Clock;
      case 'available': return BookOpen;
      default: return BookOpen;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#10b981';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const handleEnrollCourse = (courseId: string) => {
    console.log('Enrolling in course:', courseId);
    alert('Successfully enrolled in course! This would update the enrollment status in a real application.');
  };

  const handleStartCourse = (courseId: string) => {
    console.log('Starting course:', courseId);
    alert('Course started! This would begin the course in a real application.');
  };

  const handleDownloadCertificate = (courseId: string) => {
    console.log('Downloading certificate:', courseId);
    alert('Certificate download started! This would download the certificate in a real application.');
  };

  const handleViewCourse = (courseId: string) => {
    console.log('Viewing course:', courseId);
    alert('Course details opened! This would open the course content in a real application.');
  };

  // Calculate statistics
  const totalCourses = courses.length;
  const completedCourses = courses.filter(c => c.status === 'completed').length;
  const enrolledCourses = courses.filter(c => c.status === 'enrolled' || c.status === 'in_progress').length;
  const availableCourses = courses.filter(c => c.status === 'available').length;
  const totalCost = courses.reduce((sum, course) => sum + course.cost, 0);
  const averageProgress = courses.reduce((sum, course) => sum + course.progress, 0) / courses.length;

  return (
    <div style={{ 
      padding: '24px', 
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#1f2937' }}>
          Training & Certification
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Manage your maritime training courses and certifications
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#dbeafe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={20} color="#3b82f6" />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1f2937' }}>
                {totalCourses}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Total Courses</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#dcfce7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={20} color="#10b981" />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1f2937' }}>
                {completedCourses}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Completed</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#e9d5ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} color="#8b5cf6" />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1f2937' }}>
                {enrolledCourses}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Enrolled</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#fef3c7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={20} color="#f59e0b" />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1f2937' }}>
                {formatCurrency(totalCost, 'USD').replace('.00', '')}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Total Investment</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#e0f2fe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} color="#0ea5e9" />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1f2937' }}>
                {Math.round(averageProgress)}%
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Avg Progress</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#f0f9ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={20} color="#0284c7" />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1f2937' }}>
                {availableCourses}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#f9fafb'
              }}
            />
          </div>

          {/* Sort */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'title' | 'date' | 'progress' | 'cost')}
              style={{
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="title">Sort by Title</option>
              <option value="date">Sort by Date</option>
              <option value="progress">Sort by Progress</option>
              <option value="cost">Sort by Cost</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              style={{
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { key: 'all', label: 'All Courses', count: totalCourses },
            { key: 'enrolled', label: 'Enrolled', count: enrolledCourses },
            { key: 'completed', label: 'Completed', count: completedCourses },
            { key: 'available', label: 'Available', count: availableCourses }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key as any)}
              style={{
                padding: '12px 20px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: selectedTab === tab.key ? '#3b82f6' : '#f1f5f9',
                color: selectedTab === tab.key ? 'white' : '#64748b',
                cursor: 'pointer',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {tab.label}
              <span style={{
                backgroundColor: selectedTab === tab.key ? 'rgba(255,255,255,0.2)' : '#d1d5db',
                color: selectedTab === tab.key ? 'white' : '#6b7280',
                padding: '2px 6px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Course Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
        gap: '24px' 
      }}>
        {sortedCourses.map((course) => {
          const StatusIcon = getStatusIcon(course.status);
          const daysUntilExpiry = course.certificateValidity ? 
            Math.ceil((new Date(course.completedAt || '').getTime() + (course.certificateValidity * 30 * 24 * 60 * 60 * 1000) - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
          
          return (
            <div key={course.id} style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              border: selectedCourse === course.id ? '2px solid #3b82f6' : '1px solid #e2e8f0'
            }}>
              {/* Header */}
              <div style={{ padding: '20px 20px 16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 4px 0', color: '#1f2937' }}>
                      {course.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                      {course.provider}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 8px',
                      backgroundColor: `${getStatusColor(course.status)}20`,
                      borderRadius: '6px'
                    }}>
                      <StatusIcon size={14} color={getStatusColor(course.status)} />
                      <span style={{ fontSize: '12px', fontWeight: '500', color: getStatusColor(course.status) }}>
                        {course.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Course Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#6b7280' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} />
                    <span>{course.duration} hours</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Target size={16} />
                    <span style={{ 
                      color: getDifficultyColor(course.difficulty),
                      fontWeight: '500',
                      textTransform: 'capitalize'
                    }}>
                      {course.difficulty}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <DollarSign size={16} />
                    <span>{formatCurrency(course.cost, course.currency)}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {course.status !== 'available' && (
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                      Progress
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                      {course.progress}%
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${course.progress}%`,
                      height: '100%',
                      backgroundColor: getStatusColor(course.status),
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              )}

              {/* Details */}
              <div style={{ padding: '16px 20px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0', fontWeight: '500' }}>DESCRIPTION</p>
                  <p style={{ fontSize: '14px', color: '#1f2937', margin: 0, lineHeight: '1.4' }}>
                    {course.description}
                  </p>
                </div>

                {/* Course Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0', fontWeight: '500' }}>CATEGORY</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <BookOpen size={14} color="#6b7280" />
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                        {course.category}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0', fontWeight: '500' }}>FORMAT</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Play size={14} color="#6b7280" />
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937', textTransform: 'capitalize' }}>
                        {course.format}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Instructor */}
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: '#f8fafc', 
                  borderRadius: '8px', 
                  marginBottom: '16px',
                  border: '1px solid #e2e8f0'
                }}>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0', fontWeight: '500' }}>INSTRUCTOR</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#3b82f6',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {course.instructor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937', margin: '0 0 2px 0' }}>
                        {course.instructor.name}
                      </p>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                        {course.instructor.experience} years experience
                      </p>
                    </div>
                  </div>
                </div>

                {/* Certificate Info */}
                {course.status === 'completed' && course.certificateUrl && (
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#dcfce7', 
                    borderRadius: '8px', 
                    marginBottom: '16px',
                    border: '1px solid #bbf7d0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Award size={16} color="#10b981" />
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#166534' }}>
                        Certificate Available
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#15803d', margin: 0 }}>
                      Valid for {course.certificateValidity} months
                      {daysUntilExpiry > 0 && ` • ${daysUntilExpiry} days remaining`}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {course.status === 'available' && (
                    <button
                      onClick={() => handleEnrollCourse(course.id)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <BookOpen size={16} />
                      Enroll
                    </button>
                  )}

                  {(course.status === 'enrolled' || course.status === 'in_progress') && (
                    <>
                      <button
                        onClick={() => handleStartCourse(course.id)}
                        style={{
                          flex: 1,
                          padding: '12px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Play size={16} />
                        Continue
                      </button>
                      <button
                        onClick={() => handleViewCourse(course.id)}
                        style={{
                          padding: '12px',
                          backgroundColor: '#f1f5f9',
                          color: '#64748b',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Eye size={16} />
                      </button>
                    </>
                  )}

                  {course.status === 'completed' && (
                    <>
                      <button
                        onClick={() => handleDownloadCertificate(course.id)}
                        style={{
                          flex: 1,
                          padding: '12px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Download size={16} />
                        Download Certificate
                      </button>
                      <button
                        onClick={() => handleViewCourse(course.id)}
                        style={{
                          padding: '12px',
                          backgroundColor: '#f1f5f9',
                          color: '#64748b',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Eye size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {sortedCourses.length === 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '48px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <GraduationCap size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0' }}>
            No courses found
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            {searchQuery ? 'Try adjusting your search criteria' : 'No courses match the selected filter'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Training;