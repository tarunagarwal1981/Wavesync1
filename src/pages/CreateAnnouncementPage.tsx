import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { supabase } from '../lib/supabase';
import { 
  Megaphone, 
  X, 
  Upload, 
  AlertTriangle,
  AlertCircle,
  Info as InfoIcon,
  Bell,
  Loader2
} from 'lucide-react';
import styles from './CreateAnnouncementPage.module.css';
import { createBroadcast } from '../services/broadcast.service';
import type { BroadcastPriority, BroadcastTargetType } from '../types/broadcast.types';

interface CreateAnnouncementFormData {
  title: string;
  priority: BroadcastPriority;
  targetType: BroadcastTargetType;
  targetIds: string[];
  message: string;
  attachments: File[];
  pinned: boolean;
  requiresAcknowledgment: boolean;
  sendEmailNotification: boolean;
  expiresAt: string;
}

interface ValidationErrors {
  title?: string;
  priority?: string;
  targetType?: string;
  message?: string;
  attachments?: string;
  expiresAt?: string;
}

export const CreateAnnouncementPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [formData, setFormData] = useState<CreateAnnouncementFormData>({
    title: '',
    priority: 'normal',
    targetType: 'all',
    targetIds: [],
    message: '',
    attachments: [],
    pinned: false,
    requiresAcknowledgment: false,
    sendEmailNotification: false,
    expiresAt: ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  
  // Dropdown data
  const [vessels, setVessels] = useState<any[]>([]);
  const [ranks, setRanks] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  // Fetch dropdown data on mount
  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      // Fetch vessels
      const { data: vesselsData, error: vesselsError } = await supabase
        .from('vessels')
        .select('id, name, imo_number')
        .order('name');

      if (vesselsError) throw vesselsError;
      setVessels(vesselsData || []);

      // Fetch unique ranks from seafarer_profiles
      const { data: ranksData, error: ranksError } = await supabase
        .from('seafarer_profiles')
        .select('rank')
        .not('rank', 'is', null);

      if (ranksError) throw ranksError;
      
      // Get unique ranks
      const uniqueRanks = [...new Set(ranksData?.map((r: any) => r.rank).filter(Boolean))] as string[];
      setRanks(uniqueRanks.sort());

      // Set predefined availability statuses
      setStatuses(['available', 'on_leave', 'on_assignment', 'unavailable']);

    } catch (error) {
      addToast({
        title: 'Warning',
        description: 'Failed to load some dropdown options',
        type: 'error'
      });
    } finally {
      setLoadingDropdowns(false);
    }
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be 200 characters or less';
    }

    // Priority validation
    if (!formData.priority) {
      newErrors.priority = 'Priority is required';
    }

    // Target validation
    if (!formData.targetType) {
      newErrors.targetType = 'Target audience is required';
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    } else if (formData.message.length > 5000) {
      newErrors.message = 'Message must be 5000 characters or less';
    }

    // Expiry date validation
    if (formData.expiresAt) {
      const expiryDate = new Date(formData.expiresAt);
      const now = new Date();
      if (expiryDate <= now) {
        newErrors.expiresAt = 'Expiry date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      addToast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        type: 'error'
      });
      return;
    }

    setSubmitting(true);

    try {
      await createBroadcast({
        title: formData.title,
        message: formData.message,
        priority: formData.priority,
        target_type: formData.targetType,
        target_ids: formData.targetIds.length > 0 ? formData.targetIds : undefined,
        pinned: formData.pinned,
        requires_acknowledgment: formData.requiresAcknowledgment,
        expires_at: formData.expiresAt || undefined,
        // TODO: Add attachments when file upload is implemented
      });

      addToast({
        title: 'Success!',
        description: 'Announcement sent successfully',
        type: 'success'
      });

      navigate('/announcements');
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to send announcement',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/announcements');
  };

  // Handle file selection (placeholder)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // TODO: Implement file validation (type, size)
    setFormData(prev => ({ ...prev, attachments: files }));
  };

  // Get character count for message
  const messageCharCount = formData.message.length;
  const messageCharMax = 5000;

  // Get priority icon
  const getPriorityIcon = (priority: BroadcastPriority) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle size={18} />;
      case 'important':
        return <AlertCircle size={18} />;
      case 'normal':
        return <Bell size={18} />;
      case 'info':
        return <InfoIcon size={18} />;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Megaphone className={styles.headerIcon} size={32} />
          <div>
            <h1 className={styles.title}>Create New Announcement</h1>
            <p className={styles.subtitle}>
              Send important updates to seafarers
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className={styles.formCard}>
        <div className={styles.formBody}>
          {/* Title */}
          <div className={styles.formField}>
            <label htmlFor="title" className={styles.label}>
              Title <span className={styles.required}>*</span>
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
              placeholder="Enter announcement title"
              maxLength={200}
            />
            {errors.title && (
              <span className={styles.error}>{errors.title}</span>
            )}
            <span className={styles.hint}>
              {formData.title.length}/200 characters
            </span>
          </div>

          {/* Priority */}
          <div className={styles.formField}>
            <label className={styles.label}>
              Priority <span className={styles.required}>*</span>
            </label>
            <div className={styles.prioritySelector}>
              {(['critical', 'important', 'normal', 'info'] as BroadcastPriority[]).map((priority) => (
                <label
                  key={priority}
                  className={`${styles.priorityOption} ${
                    formData.priority === priority ? styles.priorityOptionActive : ''
                  } ${styles[`priority${priority.charAt(0).toUpperCase() + priority.slice(1)}`]}`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={priority}
                    checked={formData.priority === priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as BroadcastPriority })}
                    className={styles.radioInput}
                  />
                  <span className={styles.priorityIcon}>{getPriorityIcon(priority)}</span>
                  <span className={styles.priorityLabel}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </span>
                </label>
              ))}
            </div>
            {errors.priority && (
              <span className={styles.error}>{errors.priority}</span>
            )}
          </div>

          {/* Target Audience */}
          <div className={styles.formField}>
            <label className={styles.label}>
              Target Audience <span className={styles.required}>*</span>
            </label>
            <div className={styles.targetSelector}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.targetType === 'all'}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({ ...formData, targetType: 'all', targetIds: [] });
                    }
                  }}
                  className={styles.checkbox}
                />
                <span>All Seafarers</span>
              </label>

              {/* Additional target options (disabled if "All" is selected) */}
              <div className={`${styles.targetOptions} ${formData.targetType === 'all' ? styles.disabled : ''}`}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.targetType === 'vessel'}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, targetType: 'vessel', targetIds: [] });
                      }
                    }}
                    disabled={formData.targetType === 'all'}
                    className={styles.checkbox}
                  />
                  <span>By Vessel</span>
                </label>
                {formData.targetType === 'vessel' && (
                  <select 
                    className={styles.select}
                    value={formData.targetIds[0] || ''}
                    onChange={(e) => setFormData({ ...formData, targetIds: e.target.value ? [e.target.value] : [] })}
                    disabled={loadingDropdowns}
                  >
                    <option value="">Select Vessel</option>
                    {vessels.map((vessel) => (
                      <option key={vessel.id} value={vessel.id}>
                        {vessel.name} {vessel.imo_number ? `(${vessel.imo_number})` : ''}
                      </option>
                    ))}
                  </select>
                )}

                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.targetType === 'rank'}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, targetType: 'rank', targetIds: [] });
                      }
                    }}
                    disabled={formData.targetType === 'all'}
                    className={styles.checkbox}
                  />
                  <span>By Rank</span>
                </label>
                {formData.targetType === 'rank' && (
                  <select 
                    className={styles.select}
                    value={formData.targetIds[0] || ''}
                    onChange={(e) => setFormData({ ...formData, targetIds: e.target.value ? [e.target.value] : [] })}
                    disabled={loadingDropdowns}
                  >
                    <option value="">Select Rank</option>
                    {ranks.map((rank) => (
                      <option key={rank} value={rank}>
                        {rank}
                      </option>
                    ))}
                  </select>
                )}

                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.targetType === 'status'}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, targetType: 'status', targetIds: [] });
                      }
                    }}
                    disabled={formData.targetType === 'all'}
                    className={styles.checkbox}
                  />
                  <span>By Status</span>
                </label>
                {formData.targetType === 'status' && (
                  <select 
                    className={styles.select}
                    value={formData.targetIds[0] || ''}
                    onChange={(e) => setFormData({ ...formData, targetIds: e.target.value ? [e.target.value] : [] })}
                    disabled={loadingDropdowns}
                  >
                    <option value="">Select Status</option>
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            {errors.targetType && (
              <span className={styles.error}>{errors.targetType}</span>
            )}
          </div>

          {/* Message */}
          <div className={styles.formField}>
            <label htmlFor="message" className={styles.label}>
              Message <span className={styles.required}>*</span>
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className={`${styles.textarea} ${errors.message ? styles.inputError : ''}`}
              placeholder="Enter your announcement message..."
              rows={8}
              maxLength={5000}
            />
            {errors.message && (
              <span className={styles.error}>{errors.message}</span>
            )}
            <span className={`${styles.hint} ${
              messageCharCount > messageCharMax || (messageCharMax - messageCharCount) < 100 
                ? styles.hintError 
                : ''
            }`}>
              {messageCharCount}/{messageCharMax} characters
              {(messageCharMax - messageCharCount) < 100 && messageCharCount <= messageCharMax && (
                <span> - {messageCharMax - messageCharCount} remaining</span>
              )}
            </span>
          </div>

          {/* Attachments (Placeholder) */}
          <div className={styles.formField}>
            <label htmlFor="attachments" className={styles.label}>
              Attachments <span className={styles.optional}>(Optional)</span>
            </label>
            <div className={styles.fileUpload}>
              <input
                id="attachments"
                type="file"
                multiple
                onChange={handleFileChange}
                className={styles.fileInput}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <label htmlFor="attachments" className={styles.fileLabel}>
                <Upload size={20} />
                <span>Choose Files</span>
              </label>
              <span className={styles.fileHint}>
                PDF, JPG, PNG, DOC (Max 5 files, 10MB each)
              </span>
            </div>
            {formData.attachments.length > 0 && (
              <div className={styles.fileList}>
                {formData.attachments.map((file, index) => (
                  <div key={index} className={styles.fileItem}>
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newFiles = [...formData.attachments];
                        newFiles.splice(index, 1);
                        setFormData({ ...formData, attachments: newFiles });
                      }}
                      className={styles.fileRemove}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Options */}
          <div className={styles.formField}>
            <label className={styles.label}>Options</label>
            <div className={styles.optionsGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.pinned}
                  onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                  className={styles.checkbox}
                />
                <span>Pin announcement</span>
                <span className={styles.optionHint}>Show at the top of the feed</span>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.requiresAcknowledgment}
                  onChange={(e) => setFormData({ ...formData, requiresAcknowledgment: e.target.checked })}
                  className={styles.checkbox}
                />
                <span>Require acknowledgment</span>
                <span className={styles.optionHint}>Users must acknowledge this announcement</span>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.sendEmailNotification}
                  onChange={(e) => setFormData({ ...formData, sendEmailNotification: e.target.checked })}
                  className={styles.checkbox}
                  disabled
                />
                <span>Send email notification</span>
                <span className={styles.optionHint}>(Coming soon)</span>
              </label>
            </div>
          </div>

          {/* Expiry Date */}
          <div className={styles.formField}>
            <label htmlFor="expiresAt" className={styles.label}>
              Expires <span className={styles.optional}>(Optional)</span>
            </label>
            <input
              id="expiresAt"
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              className={`${styles.input} ${errors.expiresAt ? styles.inputError : ''}`}
            />
            {errors.expiresAt && (
              <span className={styles.error}>{errors.expiresAt}</span>
            )}
            <span className={styles.hint}>
              Announcement will be automatically hidden after this date
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={handleCancel}
            disabled={submitting}
            className={styles.buttonSecondary}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || loadingDropdowns}
            className={styles.buttonPrimary}
          >
            {submitting ? (
              <>
                <Loader2 className={styles.spinner} size={16} />
                Sending...
              </>
            ) : (
              'Send Announcement'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAnnouncementPage;

