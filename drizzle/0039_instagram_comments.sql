-- Comentários recebidos no Instagram + respostas automáticas
CREATE TABLE IF NOT EXISTS `instagram_comment_replies` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `commentId` varchar(100) NOT NULL UNIQUE,       -- ID do comentário na Meta API
  `postId` varchar(100),                           -- ID do post
  `authorName` varchar(200),                       -- nome de quem comentou
  `authorId` varchar(100),                         -- ID do autor
  `commentText` text NOT NULL,                     -- texto do comentário
  `category` varchar(50),                          -- question|compliment|complaint|spam|other
  `replyText` text,                                -- resposta gerada
  `status` enum('pending','auto_replied','queued_review','ignored','rejected') NOT NULL DEFAULT 'pending',
  `errorMessage` varchar(500),
  `repliedAt` timestamp NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
