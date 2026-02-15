<?php

/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */

use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;
use TYPO3Fluid\Fluid\Core\Rendering\RenderingContextInterface;
use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper;

/**
 * Class JsonMenuViewHelper
 *
 * @author Steffen Kroggel <developer@steffenkroggel.de>
 * @copyright Steffen Kroggel <developer@steffenkroggel.de>
 * @package Madj2k_SiteDefault
 * @license http://www.gnu.org/licenses/gpl.html GNU General Public License, version 3 or later
 */
class JsonMenuViewHelper extends AbstractViewHelper
{

    /**
     * Initialize arguments
     *
     * @return void
     */
    public function initializeArguments(): void
    {
        parent::initializeArguments();
        $this->registerArgument('items', 'array', 'The recursive menu-array');
        $this->registerArgument('parseFuncTSPath', 'string', 'Path to the TypoScript parseFunc setup.',  false, '');
    }


    /**
     * @param array $arguments
     * @param \Closure $renderChildrenClosure
     * @param \TYPO3Fluid\Fluid\Core\Rendering\RenderingContextInterface $renderingContext
     * @return string
     */
    public static function renderStatic(
        array $arguments,
        \Closure $renderChildrenClosure,
        RenderingContextInterface $renderingContext
    ):  string {

        /** @var array $items  */
        $items = $arguments['items'];

        /** @var string $parseFuncTSPath */
        $parseFuncTSPath = $arguments['parseFuncTSPath'];

        /** @var \Psr\Http\Message\ServerRequestInterface $request */
        $request = $renderingContext->getRequest();

        /** @var \TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer $contentObject */
        $contentObject = GeneralUtility::makeInstance(ContentObjectRenderer::class);
        $contentObject->setRequest($request);
        $contentObject->start([]);

        $result = [];
        foreach ($items as $item) {
            $result[] = self::callback($item, $contentObject, $parseFuncTSPath);
        }

        return json_encode($result);
    }


    /**
     * @param array $item
     * @param \TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer $contentObject
     * @param string $parseFuncTSPath
     * @return array
     */
    public static function callback (
        array $item,
        ContentObjectRenderer $contentObject,
        string $parseFuncTSPath = ''
    ): array {

        /*
            Build a reduced structure:
                "data": {"uid": 2, "pid": 1, "title": "Lorem Ipsum"},
                "title": "Lorem Ipsum",
                "link": "\/lorem\/Ipsum",
                "target": "_blank",
                "active": 1,
                "current": 0,
                "spacer": 0,
                "hasSubpages": 1,
                "children": [ ]
         */

        $result = $item;
        $result['data'] = [
            'uid' => $item['data']['uid'],
            'pid' => $item['data']['pid'],
            'title'=> $item['data']['title'],
        ];

        $result['children'] = [];
        if (
            (isset($item['children']))
            && (is_array($item['children']))
        ){
            foreach ($item['children'] as $child) {
                $result['children'][] = self::callback($child, $contentObject, $parseFuncTSPath);
            }
        }

        if (!isset($result['hasSubpages'])) {
            $result['hasSubpages'] = $result['children'] ? 1 : 0;
        }

        if (isset($item['data']['doktype'])) {
            $result['linkType'] =  $item['data']['doktype'];
        }

        // Parse title with HTML-parser
        if ($parseFuncTSPath) {
            $result['title'] = $contentObject->parseFunc($result['title'], null, '< ' . $parseFuncTSPath);
        }

        // do not link sites, that only link to the next subpage!
        $result['isLinked'] = 1;
        if (
            ($item['data']['doktype'] == 4)
            && (in_array($item['data']['shortcut_mode'], [1,3]))
        ){
            $result['isLinked'] = 0;
        }

        return $result;
    }
}
