-- Add new fields to Matches table for enhanced game functionality
ALTER TABLE Matches 
ADD COLUMN question_count INTEGER DEFAULT 10,
ADD COLUMN current_question_index INTEGER DEFAULT 0,
ADD COLUMN status ENUM('pending', 'active', 'completed') DEFAULT 'pending';

-- Create Match_Questions table
CREATE TABLE IF NOT EXISTS Match_Questions (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    match_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    question_order INTEGER NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES Matches(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (question_id) REFERENCES Questions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY unique_match_question (match_id, question_id),
    INDEX idx_match_order (match_id, question_order)
);