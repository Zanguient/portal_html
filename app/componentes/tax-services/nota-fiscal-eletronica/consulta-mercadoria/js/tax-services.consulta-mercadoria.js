/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0 - 25/09/2015
 *
 */

// App
angular.module("tax-services-consulta-mercadoria", []) 

.controller("tax-services-consulta-mercadoriaCtrl", ['$scope',   
                                            '$state',
                                            '$http',
                                            '$window',
                                            /*'$campos',*/
                                            '$webapi',
                                            '$apis', 
                                            '$timeout',
                                            '$filter',
                                            function($scope,$state,$http,$window,/*$campos,*/
                                                     $webapi,$apis,$timeout,$filter){ 
   
    $scope.confirmRecebimento = false;
    $scope.paginaInformada = 1;                                          
    $scope.itens_pagina = [50, 100, 150, 200];                                      
    $scope.filtro = { itens_pagina : $scope.itens_pagina[0], pagina : 1,
                      total_registros : 0, faixa_registros : '0-0', total_paginas : 0, chaveAcesso : null,cdMercadoria: null,dsMercadoria:null};
    $scope.classificacao = {idMercadoria: null,nrNCM: null,prIPI: null,prICMS: null,prPIS: null,prCOFINS: null,dsObservacao: null,idUsers: null};
    $scope.tabFiltro = 1; 
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyManifestoPos = 1; // posição da div que vai receber o loading progress                                         
    // flags                                   
    $scope.exibeTela = false;                                                                                                    
                                                
    // Inicialização do controller
    $scope.taxServices_consultaMercadoriaInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Nota Fiscal Eletrônica';                          
        $scope.pagina.subtitulo = 'Consulta Mercadoria';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            if($scope.exibeTela){
                // Avalia grupo empresa
                if($scope.usuariologado.grupoempresa){ 
                    // Refaz busca
                    // ...
                }else{ // reseta tudo e não faz buscas 
                    // reseta array... 
                }
            }
        }); 
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // faz busca inicial....
        }); 
        // Acessou a tela
        //$scope.$emit("acessouTela");
        $scope.exibeTela = true;
        // ... busca inicial
    };                                                                                      
                                            
        /**
      * Limpa os filtros
      */
    $scope.limpaFiltros = function(){   
        ultimoFiltroBusca = undefined;
        $scope.filtro.cdMercadoria = null; 
        $scope.filtro.dsMercadoria = null;
        $scope.filtro.chaveAcesso = null;
    }
    
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.filtro.total_paginas){ 
           $scope.filtro.pagina = pagina;
           // busca mercadorias.... 
       }
       $scope.atualizaPaginaDigitada();    
    };
    /**
      * Vai para a página anterior
      */
    $scope.retrocedePagina = function(){
        setPagina($scope.filtro.pagina - 1); 
    };
    /**
      * Vai para a página seguinte
      */                                            
    $scope.avancaPagina = function(){
        setPagina($scope.filtro.pagina + 1); 
    };
    /**
      * Foi informada pelo usuário uma página para ser exibida
      */                                            
    $scope.alteraPagina = function(){
        if($scope.paginaInformada) setPagina(parseInt($scope.paginaInformada));
        else $scope.atualizaPaginaDigitada();  
    };
    /**
      * Sincroniza a página digitada com a que efetivamente está sendo exibida
      */                                            
    $scope.atualizaPaginaDigitada = function(){
        $scope.paginaInformada = $scope.filtro.pagina; 
    };                                             
    /**
      * Notifica que o total de itens por página foi alterado
      */                                            
    $scope.alterouItensPagina = function(){
        //if($scope.recebimentos.length > 0) // busca recebimentos....    
    };
                                                
                                                
    /* FILTRO */
                                                
   /**
      * Obtém os filtros de busca
      */
    var obtemFiltrosBuscaMercadoria = function(){
        var filtros = [];
        
            // Filtros Por Mercoria
       if($scope.tabFiltro === 1)
       {
           var filtroData = undefined;
            // Filtro Por Código 
            if($scope.filtro.cdMercadoria && $scope.filtro.cdMercadoria !== ''){
                filtros.push({id: /*$campos.tax.tbmercadoria.cdmercadoria */ 103,
                              valor: $scope.filtro.cdMercadoria});
            }

            // Filtro Por Descrição
            if($scope.filtro.dsMercadoria && $scope.filtro.dsMercadoria !== null){
                filtros.push({id: /*$campos.tax.tbmercadoria.dsmercadoria */ 104,
                              valor: $scope.filtro.dsMercadoria}); 
            }
       }
        else
           {
            if($scope.filtro.chaveAcesso && $scope.filtro.chaveAcesso !== null){
                filtros.push({id: /*$campos.tax.tbmanifesto.nrCNPJ*/ 130, 
                             valor: $scope.filtro.chaveAcesso}); 
           }
           }
         return filtros.length > 0 ? filtros : undefined;
    }
    
    
    /**
      * Obtem as mercadorias a partir da Chave de Acesso
      */
    $scope.buscaMercadorias = function(){
        // Avalia se há um grupo empresa selecionado
        if(!$scope.usuariologado.grupoempresa){
            $scope.showModalAlerta('Por favor, selecione uma empresa', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){ $scope.setVisibilidadeBoxGrupoEmpresa(true);}, 300);
                                    }
                                  );
            return;   
        }
        
        // Nova busca
        buscaMercadorias();
    }
                                                
    var buscaMercadorias = function(idMercadoria){
        // Abre os progress
       $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen     
       $scope.showProgress(divPortletBodyManifestoPos);
        
        var filtros = [];
       // Filtros
        if(idMercadoria)
            {
                filtros.push({id: /*$campos.tax.tbmercadoria.idMercadoria */ 100,
                              valor: idMercadoria}); 
            }
        else
            {
            filtros = obtemFiltrosBuscaMercadoria(); 
            }
     
       if( filtros !=  undefined)
       {
           $scope.mercadorias = undefined;
           //$scope.confirmRecebimento = false;
           
           $webapi.get($apis.getUrl($apis.tax.tbmercadoria, 
                                    [$scope.token, 1, /* $campos.tax.tbmercadoria.dsmercadoria */104,0],
                                    filtros)) 
                .then(function(dados){
                    // Guarda o último filtro utilizado
                    ultimoFiltroBusca = filtros;

                    // Obtém os dados
                    $scope.mercadorias = dados.Registros;
                    if($scope.mercadorias.length > 0)
                        {
                        $scope.classificacao = $scope.mercadorias[0].ultimaClassificacao;
                        }
                    
                    // Set valores de exibição
                    $scope.filtro.total_registros = dados.TotalDeRegistros;
                    $scope.filtro.total_paginas = Math.ceil($scope.filtro.total_registros / $scope.filtro.itens_pagina);
                    if($scope.mercadorias.length === 0) $scope.faixa_registros = '0-0';
                    else{
                        var registroInicial = ($scope.filtro.pagina - 1)*$scope.filtro.itens_pagina + 1;
                        var registroFinal = registroInicial - 1 + $scope.filtro.itens_pagina;
                        if(registroFinal > $scope.filtro.total_registros) registroFinal = $scope.filtro.total_registros;
                        $scope.filtro.faixa_registros =  registroInicial + '-' + registroFinal;
                    }
                    // Verifica se a página atual é maior que o total de páginas
                    if($scope.filtro.pagina > $scope.filtro.total_paginas)
                        setPagina(1); // volta para a primeira página e refaz a busca

                    // Fecha os progress
                    $scope.hideProgress(divPortletBodyFiltrosPos);
                    $scope.hideProgress(divPortletBodyManifestoPos);
                  },
                  function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao obter mercadorias (' + failData.status + ')', true, 'danger', true);
                    // Quando a busca for por chave de acesso, força o usuário digitar a Chave de Acesso
               
                     // Fecha os progress
                     $scope.hideProgress(divPortletBodyFiltrosPos);
                     $scope.hideProgress(divPortletBodyManifestoPos);
               
                  });           
       }
        else
            { 
                $scope.mercadorias = undefined;
                
                // Fecha os progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyManifestoPos);
            }
        
    }
    
    /*
    Insere uma nova classificação
    */
    $scope.insereClassificacao = function(){
        // Avalia se há um grupo empresa selecionado
        if(!$scope.usuariologado.grupoempresa){
            $scope.showModalAlerta('Por favor, selecione uma empresa', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){ $scope.setVisibilidadeBoxGrupoEmpresa(true);}, 300);
                                    }
                                  );
            return;   
        }
        
        // Nova busca
        insereClassificaco();
        //console.log($scope.classificacao);
    }
                                                
    var insereClassificaco = function(){
        // Abre os progress
       $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen     
       $scope.showProgress(divPortletBodyManifestoPos);
        
           
        $webapi.post($apis.getUrl($apis.tax.tbmercadoriaclassificada, undefined,
                                  {id: 'token', valor: $scope.token}), $scope.classificacao)
                .then(function(dados){
            
                    // Fecha os progress
                    $scope.hideProgress(divPortletBodyFiltrosPos);
                    $scope.hideProgress(divPortletBodyManifestoPos);
            
                    buscaMercadorias($scope.classificacao.idMercadoria);
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao inserir uma classificação (' + failData.status + ')', true, 'danger', true);
                     // Hide progress
                     $scope.hideProgress(divPortletBodyFiltrosPos);
                     $scope.hideProgress(divPortletBodyManifestoPos);
                  });          
       
    }
    
    // TABELA EXPANSÍVEL
    $scope.toggle = function(mercadoria){
        if(!mercadoria || mercadoria === null) return;
        if(mercadoria.collapsed) mercadoria.collapsed = false;
        else mercadoria.collapsed = true;
    }
    $scope.isExpanded = function(mercadoria){
        if(!mercadoria || mercadoria === null) return;
        return mercadoria.collapsed;
    }
    
    //TAB FILTROS
    /**
      * Retorna true se a tab informada corresponde a tab em exibição
      */
    $scope.tabFiltroIs = function (tabFiltro){
        return $scope.tabFiltro === tabFiltro;
    }
    /**
      * Altera a tab em exibição
      */
    $scope.setTabFiltro = function (tabFiltro){
        if (tabFiltro >= 1 && tabFiltro <= 2) $scope.tabFiltro = tabFiltro;        
    }
    
}])
