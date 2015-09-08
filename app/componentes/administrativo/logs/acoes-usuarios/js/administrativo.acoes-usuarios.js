/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão: 1.0 - 03/09/2015
 *
 */

// App
angular.module("administrativo-acoes-usuarios", []) 

.controller("administrativo-acoes-usuariosCtrl", ['$scope',
                                            '$state',
                                            '$http',
                                            /*'$campos',*/
                                            '$webapi',
                                            '$apis',
                                            '$filter', 
                                            function($scope,$state,$http,/*$campos,*/
                                                     $webapi,$apis,$filter){ 
   
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyLogsPos = 1; // posição da div que vai receber o loading progress
    $scope.paginaInformada = 1; // página digitada pelo privilégio
    $scope.modalLog = { log : null };                                               
    $scope.logs = [];
    $scope.acoes = ['DELETE', 'GET', 'PATCH', 'POST', 'PUT'];
    $scope.aplicacoes = [{id: 'M', nome: 'MOBILE'}, {id: 'P', nome : 'PORTAL'}];
    $scope.respostas = [{id : 200, nome: '200 - OK'}, 
                        {id : 401, nome: '401 - NÃO AUTORIZADO'}, 
                        {id : 404, nome: '404 - NÃO ENCONTRADO'}, 
                        {id : 500, nome: '500 - ERRO INTERNO'}];
    $scope.camposBusca = [{
                            /*id: $campos.administracao.tblogacessousuario.webpagesusers + 
                                  $campos.administracao.webpagesusers.ds_login - 100,*/
                            id: 201,
                            ativo: true,  
                            nome: "Login"
                          },
                          {
                            id: 102,//$campos.administracao.tblogacessousuario.dsUrl,
                            ativo: true,  
                            nome: "URL"
                          },
                          {
                            id: 110,//$campos.administracao.tblogacessousuario.dsJson,
                            ativo: true,  
                            nome: "JSON"
                          }];
    $scope.itens_pagina = [50, 100, 150, 200];
    $scope.filtro = { datamin : '', datamax : '',
                      aplicacao : null, acao : '', resposta : null,
                      busca:'', campo_busca : $scope.camposBusca[0], 
                      itens_pagina : $scope.itens_pagina[0], pagina : 1,
                      total_registros : 0, faixa_registros : '0-0', total_paginas : 0, 
                      campo_ordenacao : {id: 106,//$campos.administracao.tblogacessousuario.dtAcesso, 
                                         order : 1}};    
    
    // flags
    $scope.exibeTela = false;                                            
                                                
                                                
    // Inicialização do controller
    $scope.administrativo_acoesUsuariosInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Logs';                          
        $scope.pagina.subtitulo = 'Ações de Usuários';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){
            if($scope.exibeTela) buscaLogs();
        }); 
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Busca Logs
            buscaLogs();
        });
        // Acessou a tela
        $scope.$emit("acessouTela");
        // Busca Logs
        //buscaLogs();
    }; 
                                                
                                                
     // ORDENAÇÃO
    /**
      * Modifica a ordenação
      */
    var ordena = function(posCampo){
        if(posCampo >= 0 && posCampo < $scope.camposBusca.length){
            if($scope.filtro.campo_ordenacao.id !== $scope.camposBusca[posCampo].id){ 
                $scope.filtro.campo_ordenacao.id = $scope.camposBusca[posCampo].id;
                $scope.filtro.campo_ordenacao.order = 0; // começa descendente                                 
            }else
                // Inverte a ordenação: ASCENDENTE => DESCENDENTE e vice-versa                                
                $scope.filtro.campo_ordenacao.order = $scope.filtro.campo_ordenacao.order === 0 ? 1 : 0;                                
            buscaLogs(); 
        }
    };
    /**
      * Ordena por nome
      */
    $scope.ordena = function(){
        ordena(0);    
    }
    /**
      * Retorna true se a ordenação está sendo feito por nome de forma crescente
      */
    $scope.estaOrdenadoCrescente = function(){
        return $scope.filtro.campo_ordenacao.id === $scope.camposBusca[0].id && 
               $scope.filtro.campo_ordenacao.order === 0;    
    };
    /**
      * Retorna true se a ordenação está sendo feito por nome de forma decrescente
      */
    $scope.estaOrdenadoDecrescente = function(){
        return $scope.filtro.campo_ordenacao.id === $scope.camposBusca[0].id && 
               $scope.filtro.campo_ordenacao.order === 1;    
    };                          
                                            
                                            
                                                
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.filtro.total_paginas){ 
           $scope.filtro.pagina = pagina;
           buscaLogs(); 
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
        if($scope.logs.length > 0) buscaLogs();   
    };
     
                                                
    /* FILTRO */
    
    /**
      * Limpa os filtros
      */
    $scope.limpaFiltros = function(){
        // Limpar datas
        $scope.filtro.datamin = '';
        $scope.filtro.datamax = ''; 
        
        $scope.filtro.acao = ''; 
        $scope.filtro.resposta = $scope.filtro.aplicacao = null; 
    }
    
     /**
      * Retorna os filtros para ser usado junto a url para requisição via webapi
      */
    var obtemFiltroDeBusca = function(){
       var filtros = [];
    
       if($scope.filtro.datamin){    
           // Data
           var filtroData = {id: /*$campos.administracao.tblogacessousuario.dtAcesso*/ 106,
                             valor: $scope.getFiltroData($scope.filtro.datamin)}; 
           if($scope.filtro.datamax)
               filtroData.valor = filtroData.valor + '|' + $scope.getFiltroData($scope.filtro.datamax);
           filtros.push(filtroData);
       }
    
       // Aplicação
       if($scope.filtro.aplicacao && $scope.filtro.aplicacao !== null){
           var filtroAplicacao = {id: /*$campos.administracao.tblogacessousuario.dsAplicacao*/ 107, 
                               valor: $scope.filtro.aplicacao.id};
           filtros.push(filtroAplicacao);  
       }
        
       // Resposta
       if($scope.filtro.resposta && $scope.filtro.resposta !== null){
           var filtroResposta = {id: /*$campos.administracao.tblogacessousuario.codResposta*/ 108, 
                                   valor: $scope.filtro.resposta.id};
           filtros.push(filtroResposta);
       } 
        
       // Ação
       if($scope.filtro.acao && $scope.filtro.acao !== null){
           var filtroAcao = {id: /*$campos.administracao.tblogacessousuario.dsMethod*/112, 
                             valor: $scope.filtro.acao};
           filtros.push(filtroAcao);
       }
        
       // Retorna    
       return filtros;
    };
    
    // DATA
    var ajustaIntervaloDeData = function(){
      // Verifica se é necessário reajustar a data max para ser no mínimo igual a data min
      if($scope.filtro.datamax && $scope.filtro.datamax < $scope.filtro.datamin) $scope.filtro.datamax = $scope.filtro.datamin;
      if(!$scope.$$phase) $scope.$apply();
    };
    // Data MIN
    $scope.exibeCalendarioDataMin = function($event) {
        if($event){
            $event.preventDefault();
            $event.stopPropagation();
        }
        $scope.abrirCalendarioDataMin = !$scope.abrirCalendarioDataMin;
        $scope.abrirCalendarioDataMax = false;
    };
    $scope.alterouDataMin = function(){
       if($scope.filtro.datamin === null){ 
           $scope.filtro.datamin = '';
           $scope.filtro.datamax = '';
       }else ajustaIntervaloDeData();
    };
    // Data MAX
    $scope.exibeCalendarioDataMax = function($event) {
        if($event){
            $event.preventDefault();
            $event.stopPropagation();
        }
        $scope.abrirCalendarioDataMax = !$scope.abrirCalendarioDataMax;
        $scope.abrirCalendarioDataMin = false;
      };
    $scope.alterouDataMax = function(){
       if($scope.filtro.datamax === null) $scope.filtro.datamax = '';
       else ajustaIntervaloDeData();
    };
                                                
                                                
                                                
                                                
                                                
                                                
    // BUSCA
    $scope.buscaLogs = function(){
        buscaLogs();    
    }
    $scope.resetaBusca = function(){
        $scope.filtro.busca = '';
        buscaLogs();
    };                                             
    $scope.filtraLogs = function(){
        //$scope.filtro.busca = filtro;
        buscaLogs();
    };
    var buscaLogs = function(){
        
       $scope.showProgress(divPortletBodyFiltrosPos, 10000); 
       $scope.showProgress(divPortletBodyLogsPos);    
        
       var filtros = obtemFiltroDeBusca();
       
       // Só considera busca de filtro a partir de três caracteres    
       if($scope.filtro.busca.length > 0) 
           filtros.push({id: $scope.filtro.campo_busca.id, valor: $scope.filtro.busca + '%'});        
       
       // Filtro do grupo empresa => barra administrativa
       if($scope.usuariologado.grupoempresa){
            filtros.push({/*id: $campos.administracao.tblogacessousuario.webpagesusers + 
                                          $campos.administracao.webpagesusers.id_grupo - 100, */
                                      id: 203,
                                      valor: $scope.usuariologado.grupoempresa.id_grupo});
           if($scope.usuariologado.empresa){
                filtros.push({/*id: $campos.administracao.tblogacessousuario.webpagesusers + 
                                          $campos.administracao.webpagesusers.nu_cnpj - 100, */
                                      id: 204,
                                      valor: $scope.usuariologado.empresa.nu_cnpj});    
           }
       }
        
       $webapi.get($apis.getUrl($apis.administracao.tblogacessousuario, 
                                [$scope.token, 2, $scope.filtro.campo_ordenacao.id, 
                                 $scope.filtro.campo_ordenacao.order, 
                                 $scope.filtro.itens_pagina, $scope.filtro.pagina],
                   filtros)) 
            .then(function(dados){
                $scope.logs = dados.Registros;
                $scope.filtro.total_registros = dados.TotalDeRegistros;
                $scope.filtro.total_paginas = Math.ceil($scope.filtro.total_registros / $scope.filtro.itens_pagina);
                if($scope.logs.length === 0) $scope.filtro.faixa_registros = '0-0';
                else{
                    var registroInicial = ($scope.filtro.pagina - 1)*$scope.filtro.itens_pagina + 1;
                    var registroFinal = registroInicial - 1 + $scope.filtro.itens_pagina;
                    if(registroFinal > $scope.filtro.total_registros) registroFinal = $scope.filtro.total_registros;
                    $scope.filtro.faixa_registros =  registroInicial + '-' + registroFinal;
                }
                // Verifica se a página atual é maior que o total de páginas
                if($scope.filtro.pagina > $scope.filtro.total_paginas)
                    setPagina(1); // volta para a primeira página e refaz a busca
           
                $scope.hideProgress(divPortletBodyLogsPos);
                $scope.hideProgress(divPortletBodyFiltrosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao requisitar logs (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyLogsPos);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
              }); 
    };
        
                                                                                       
    
                                                
    // AÇÕES                                            
    /**
      * Exibe as todos os detalhes do log de acesso
      */
    $scope.detalhaLog = function(log){
        // Reseta permissões
        $scope.modalLog.log = log;
        // Exibe o modal
        $('#modalLog').modal('show');
        
    };                                              
    /**
      * Retorna true se o log obteve resposta de sucesso
      */
    $scope.logSucesso = function(log){
        //console.log(log);
        if(!log) return false;
        return log.codResposta === 200;
    }

}])